import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ChatPhaseRail } from './chat-phase-rail'
import { ChatConversation, CLIENT_BEAT_MS, TYPING_MS } from './chat-conversation'
import { ChatMessageRow } from './chat-message-row'
import type { RailPhase } from '@/lib/chat-rail-progress'
import type { ChatSender } from '@/lib/chat-flow-script'
import { MOTION_GATE_CLASS } from '@/lib/motion'

const phases: RailPhase[] = [
  { step: '01', count: 2 },
  { step: '02', count: 2 },
]

function fillHeight() {
  return screen.getByTestId('rail-fill').style.height
}

function nodeStates() {
  return screen
    .getAllByTestId('rail-node')
    .map((node) => node.getAttribute('data-state'))
}

describe('ChatPhaseRail without a conversation', () => {
  /**
   * This is the state the static export ships and the state reduced-motion
   * users land in: every message is already visible, so the rail must read as
   * complete rather than as a stalled progress bar.
   */
  it('renders complete', () => {
    render(<ChatPhaseRail phases={phases} />)

    expect(fillHeight()).toBe('100%')
    expect(nodeStates()).toEqual(['complete', 'complete'])
  })

  it('is decorative', () => {
    render(<ChatPhaseRail phases={phases} />)

    expect(screen.getByTestId('chat-phase-rail')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('only shows on wide screens, where the gutter exists', () => {
    render(<ChatPhaseRail phases={phases} className="hidden lg:block" />)

    const rail = screen.getByTestId('chat-phase-rail')
    expect(rail).toHaveClass('hidden')
    expect(rail).toHaveClass('lg:block')
  })

  it('labels each node with its phase number', () => {
    render(<ChatPhaseRail phases={phases} />)

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })
})

// The same harness chat-conversation.test.tsx uses, so the rail is driven by
// the real cursor rather than by a hand-set prop.
type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void
let observers: IntersectionCallback[] = []

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []

  constructor(callback: IntersectionCallback) {
    observers.push(callback)
  }
}

describe('ChatPhaseRail driven by the conversation', () => {
  const senders: ChatSender[] = ['client', 'client', 'client', 'client']

  beforeEach(() => {
    observers = []
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    // The gate replaces the old matchMedia + IntersectionObserver checks:
    // the head script resolves both before first paint, and the conversation
    // reads only its result.
    document.documentElement.classList.add(MOTION_GATE_CLASS)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.documentElement.classList.remove(MOTION_GATE_CLASS)
  })

  function renderRail() {
    // Real rows, because they are what create the observers and call
    // markEntered — the provider alone never advances its cursor.
    return render(
      <ChatConversation senders={senders}>
        <ChatPhaseRail phases={phases} />
        {senders.map((sender, index) => (
          <ChatMessageRow key={index} index={index} sender={sender}>
            {`mensagem ${index}`}
          </ChatMessageRow>
        ))}
      </ChatConversation>
    )
  }

  function arm() {
    act(() => {
      vi.advanceTimersByTime(0)
    })
  }

  function step(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms)
    })
  }

  it('empties once the conversation arms, since nothing has resolved yet', () => {
    renderRail()
    expect(fillHeight()).toBe('100%')

    arm()

    expect(fillHeight()).toBe('0%')
    expect(nodeStates()).toEqual(['pending', 'pending'])
  })

  it('advances with the reveal cursor', () => {
    renderRail()
    arm()

    // Rows report entry through the conversation's own observers.
    act(() => {
      for (const notify of observers) {
        notify([{ isIntersecting: true }])
      }
    })

    step(CLIENT_BEAT_MS)
    expect(fillHeight()).toBe('25%')
    expect(nodeStates()).toEqual(['complete', 'pending'])

    step(CLIENT_BEAT_MS)
    expect(fillHeight()).toBe('50%')

    step(CLIENT_BEAT_MS)
    expect(fillHeight()).toBe('75%')
    expect(nodeStates()).toEqual(['complete', 'complete'])
  })

  it('stays complete when the motion gate is absent', () => {
    document.documentElement.classList.remove(MOTION_GATE_CLASS)

    renderRail()
    arm()
    step(TYPING_MS * 4)

    expect(fillHeight()).toBe('100%')
    expect(nodeStates()).toEqual(['complete', 'complete'])
  })
})
