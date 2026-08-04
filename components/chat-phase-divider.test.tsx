import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ChatPhaseDivider } from './chat-phase-divider'
import { ChatConversation, CLIENT_BEAT_MS } from './chat-conversation'
import { ChatMessageRow } from './chat-message-row'
import type { ChatSender } from '@/lib/chat-flow-script'

function label() {
  return screen.getByRole('heading', { level: 3 })
}

describe('ChatPhaseDivider without a conversation', () => {
  /**
   * The static export and reduced-motion renders show every message at once,
   * so no phase may look pending — otherwise three of the four labels would sit
   * greyed out forever.
   */
  it('renders reached', () => {
    render(<ChatPhaseDivider step="02" label="DEFINIR" reachedAt={5} />)

    expect(label()).toHaveClass('text-lime')
    expect(label()).toHaveTextContent('02 · DEFINIR')
  })
})

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

describe('ChatPhaseDivider inside a conversation', () => {
  const senders: ChatSender[] = ['client', 'client']

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

  function renderDivider() {
    return render(
      <ChatConversation senders={senders}>
        {/* Reached once the second message resolves. */}
        <ChatPhaseDivider step="02" label="DEFINIR" reachedAt={2} />
        {senders.map((sender, index) => (
          <ChatMessageRow key={index} index={index} sender={sender}>
            {`mensagem ${index}`}
          </ChatMessageRow>
        ))}
      </ChatConversation>
    )
  }

  it('dims until the conversation reaches it', () => {
    renderDivider()

    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(label()).toHaveClass('text-platinum-gray')
    expect(label()).not.toHaveClass('text-lime')

    act(() => {
      for (const notify of observers) {
        notify([{ isIntersecting: true }])
      }
    })

    // One message resolved: still short of this phase.
    act(() => {
      vi.advanceTimersByTime(CLIENT_BEAT_MS)
    })
    expect(label()).toHaveClass('text-platinum-gray')

    act(() => {
      vi.advanceTimersByTime(CLIENT_BEAT_MS)
    })
    expect(label()).toHaveClass('text-lime')
  })
})
