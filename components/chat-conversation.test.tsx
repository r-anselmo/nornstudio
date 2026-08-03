import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import {
  ChatConversation,
  CATCHUP_MS,
  CLIENT_BEAT_MS,
  TYPING_MS,
} from './chat-conversation'
import { ChatMessageRow } from './chat-message-row'
import type { ChatSender } from '@/lib/chat-flow-script'

type IntersectionCallback = (
  entries: Array<{
    isIntersecting: boolean
    boundingClientRect: { top: number }
    rootBounds: { bottom: number } | null
  }>
) => void

let observers: Array<{ callback: IntersectionCallback; disconnected: boolean }> =
  []

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  private entry: { callback: IntersectionCallback; disconnected: boolean }

  constructor(callback: IntersectionCallback) {
    this.entry = { callback, disconnected: false }
    observers.push(this.entry)
  }

  observe = () => {}
  unobserve = () => {}
  takeRecords = () => []
  disconnect = () => {
    this.entry.disconnected = true
  }
}

/** Fires the observer for the row at `index` as if it rose in from the bottom. */
function enter(index: number) {
  const observer = observers[index]
  if (!observer || observer.disconnected) return
  observer.callback([
    {
      isIntersecting: true,
      boundingClientRect: { top: 100 },
      rootBounds: { bottom: 800 },
    },
  ])
}

/** Fires the observer for a row the visitor has already scrolled past. */
function enterFromAbove(index: number) {
  const observer = observers[index]
  if (!observer || observer.disconnected) return
  observer.callback([
    {
      isIntersecting: false,
      boundingClientRect: { top: -400 },
      rootBounds: { bottom: 800 },
    },
  ])
}

function phases() {
  return screen
    .getAllByTestId('chat-row')
    .map((row) => row.getAttribute('data-phase'))
}

/**
 * The invariant the production bug broke: resolved messages must always be a
 * prefix of the conversation. No message may resolve while an earlier one is
 * still pending.
 */
function expectNoGaps() {
  const current = phases()
  const lastShown = current.lastIndexOf('shown')
  for (let i = 0; i < lastShown; i += 1) {
    expect(
      current[i],
      `message ${i} is "${current[i]}" while message ${lastShown} already resolved`
    ).toBe('shown')
  }
}

function renderConversation(senders: ChatSender[]) {
  return render(
    <ChatConversation senders={senders}>
      {senders.map((sender, index) => (
        <ChatMessageRow key={index} index={index} sender={sender}>
          {`mensagem ${index}`}
        </ChatMessageRow>
      ))}
    </ChatConversation>
  )
}

describe('ChatConversation', () => {
  beforeEach(() => {
    observers = []
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function arm() {
    act(() => {
      vi.advanceTimersByTime(0)
    })
  }

  /**
   * Each cursor step schedules the next one from a commit-time effect, so the
   * clock has to be advanced one step per act() rather than in one large jump.
   */
  function step(ms: number, times = 1) {
    for (let i = 0; i < times; i += 1) {
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    }
  }

  it('renders every message before arming', () => {
    renderConversation(['client', 'norn'])

    expect(phases()).toEqual(['initial', 'initial'])
    expect(screen.getByText('mensagem 0')).toBeInTheDocument()
    expect(screen.getByText('mensagem 1')).toBeInTheDocument()
  })

  it('holds a client message back while Norn is still typing', () => {
    renderConversation(['client', 'norn', 'client'])
    arm()

    act(() => {
      enter(0)
      enter(1)
      enter(2)
    })

    act(() => {
      vi.advanceTimersByTime(CLIENT_BEAT_MS)
    })
    expect(phases()).toEqual(['shown', 'typing', 'hidden'])

    // Mid-typing: the client message that follows Norn must not jump the queue.
    act(() => {
      vi.advanceTimersByTime(TYPING_MS - 50)
    })
    expect(phases()).toEqual(['shown', 'typing', 'hidden'])

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(phases()).toEqual(['shown', 'shown', 'hidden'])
  })

  it('keeps resolved messages a contiguous prefix throughout playback', () => {
    const senders: ChatSender[] = [
      'client',
      'norn',
      'client',
      'norn',
      'norn',
      'client',
    ]
    renderConversation(senders)
    arm()

    act(() => {
      senders.forEach((_, index) => enter(index))
    })

    for (let step = 0; step < 40; step += 1) {
      act(() => {
        vi.advanceTimersByTime(60)
      })
      expectNoGaps()
    }

    expect(phases()).toEqual(Array(senders.length).fill('shown'))
  })

  it('reveals one message at a time as each enters', () => {
    renderConversation(['client', 'client', 'client'])
    arm()

    act(() => {
      enter(0)
    })
    act(() => {
      vi.advanceTimersByTime(CLIENT_BEAT_MS)
    })
    expect(phases()).toEqual(['shown', 'hidden', 'hidden'])

    // Nothing further resolves until the next row actually enters.
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(phases()).toEqual(['shown', 'hidden', 'hidden'])

    act(() => {
      enter(1)
    })
    act(() => {
      vi.advanceTimersByTime(CLIENT_BEAT_MS)
    })
    expect(phases()).toEqual(['shown', 'shown', 'hidden'])
  })

  it('catches up without typing pauses when the visitor scrolls ahead', () => {
    const senders: ChatSender[] = ['norn', 'norn', 'norn', 'norn', 'norn']
    renderConversation(senders)
    arm()

    act(() => {
      senders.forEach((_, index) => enter(index))
    })

    // Backlog is past the threshold, so the frontier shows no typing dots.
    expect(phases()[0]).toBe('hidden')

    // A catch-up step is far shorter than a typing pause: these two would
    // resolve nothing at all if the cursor were still waiting out TYPING_MS.
    step(CATCHUP_MS, 2)
    expect(phases()).toEqual([
      'shown',
      'shown',
      'typing',
      'hidden',
      'hidden',
    ])

    // Backlog is down to two, so pacing resumes and dots come back.
    step(CATCHUP_MS)
    expect(phases()[2]).toBe('typing')

    step(TYPING_MS)
    expect(phases()[2]).toBe('shown')
    expectNoGaps()
  })

  it('counts rows already scrolled past as entered', () => {
    renderConversation(['client', 'client'])
    arm()

    act(() => {
      enterFromAbove(0)
      enterFromAbove(1)
    })
    step(CLIENT_BEAT_MS, 2)

    expect(phases()).toEqual(['shown', 'shown'])
  })

  it('leaves everything visible when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    renderConversation(['client', 'norn'])
    arm()

    expect(phases()).toEqual(['initial', 'initial'])
    expect(observers).toHaveLength(0)
  })

  it('leaves everything visible without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    renderConversation(['client', 'norn'])
    arm()

    expect(phases()).toEqual(['initial', 'initial'])
  })
})
