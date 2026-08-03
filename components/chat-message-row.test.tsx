import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ChatMessageRow } from './chat-message-row'

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void

let callbacks: IntersectionCallback[] = []
const observeMock = vi.fn()
const disconnectMock = vi.fn()

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  observe = observeMock
  unobserve = vi.fn()
  disconnect = disconnectMock
  takeRecords = () => []

  constructor(callback: IntersectionCallback) {
    callbacks.push(callback)
  }
}

function intersect() {
  for (const callback of callbacks) {
    callback([{ isIntersecting: true }])
  }
}

function phaseOf() {
  return screen.getByTestId('chat-row').getAttribute('data-phase')
}

describe('ChatMessageRow', () => {
  beforeEach(() => {
    callbacks = []
    observeMock.mockClear()
    disconnectMock.mockClear()
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders its children before any observer runs', () => {
    render(
      <ChatMessageRow sender="client" delayMs={0}>
        Queremos escalar
      </ChatMessageRow>
    )

    expect(phaseOf()).toBe('initial')
    expect(screen.getByText('Queremos escalar')).toBeInTheDocument()
  })

  it('hides the row and starts observing once armed', () => {
    render(
      <ChatMessageRow sender="client" delayMs={0}>
        Queremos escalar
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(phaseOf()).toBe('hidden')
    expect(observeMock).toHaveBeenCalledTimes(1)
  })

  it('reveals a client message as soon as it intersects', () => {
    render(
      <ChatMessageRow sender="client" delayMs={0}>
        Queremos escalar
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })
    act(() => {
      intersect()
    })

    expect(phaseOf()).toBe('shown')
    expect(screen.getByText('Queremos escalar')).toBeInTheDocument()
  })

  it('shows typing dots before revealing a norn message', () => {
    render(
      <ChatMessageRow sender="norn" delayMs={0}>
        Qual métrica te tira o sono hoje?
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })
    act(() => {
      intersect()
    })

    expect(phaseOf()).toBe('typing')

    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(phaseOf()).toBe('shown')
    expect(
      screen.getByText('Qual métrica te tira o sono hoje?')
    ).toBeInTheDocument()
  })

  it('stops observing after revealing', () => {
    render(
      <ChatMessageRow sender="client" delayMs={0}>
        Queremos escalar
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })
    act(() => {
      intersect()
    })

    expect(disconnectMock).toHaveBeenCalled()
  })

  it('renders its footer alongside the bubble', () => {
    render(
      <ChatMessageRow sender="norn" delayMs={0} footer={<span>2 🔥</span>}>
        Protótipo pronto.
      </ChatMessageRow>
    )

    expect(screen.getByText('2 🔥')).toBeInTheDocument()
  })

  it('stays visible when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    render(
      <ChatMessageRow sender="norn" delayMs={0}>
        Qual métrica te tira o sono hoje?
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(phaseOf()).toBe('initial')
    expect(observeMock).not.toHaveBeenCalled()
  })

  it('stays visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    render(
      <ChatMessageRow sender="client" delayMs={0}>
        Queremos escalar
      </ChatMessageRow>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(phaseOf()).toBe('initial')
    expect(screen.getByText('Queremos escalar')).toBeInTheDocument()
  })
})
