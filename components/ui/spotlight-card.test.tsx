import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SpotlightCard, SpotlightGroup } from './spotlight-card'

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void

let intersectionCallbacks: IntersectionCallback[] = []

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []

  constructor(callback: IntersectionCallback) {
    intersectionCallbacks.push(callback)
  }
}

/** `isTouchDevice` and `prefersReducedMotion` both read matchMedia. */
function stubMedia({ touch = false, reducedMotion = false } = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: coarse')
        ? touch
        : query.includes('prefers-reduced-motion')
          ? reducedMotion
          : false,
    }))
  )
}

function setVisible(isIntersecting: boolean) {
  act(() => {
    for (const callback of intersectionCallbacks) {
      callback([{ isIntersecting }])
    }
  })
}

function frames(count = 1) {
  act(() => {
    for (let i = 0; i < count; i += 1) {
      vi.advanceTimersToNextFrame()
    }
  })
}

function movePointerTo(x: number, y: number) {
  act(() => {
    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: x, clientY: y })
    )
  })
  frames()
}

function card() {
  return screen.getByTestId('spot-card')
}

function spotY() {
  return card().style.getPropertyValue('--spot-y')
}

function renderGroup() {
  return render(
    <SpotlightGroup className="grid">
      <SpotlightCard data-testid="spot-card">conteúdo</SpotlightCard>
    </SpotlightGroup>
  )
}

describe('SpotlightGroup', () => {
  beforeEach(() => {
    intersectionCallbacks = []
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    stubMedia()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders its children', () => {
    renderGroup()

    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  describe('with a pointer', () => {
    it('places the light on each card in the card own coordinates', () => {
      renderGroup()

      expect(card().style.getPropertyValue('--spot-x')).toBe('')

      movePointerTo(420, 240)

      expect(card().style.getPropertyValue('--spot-x')).toBe('420.0')
      expect(spotY()).toBe('240.0')
    })

    it('coalesces a burst of pointer moves into a single frame', () => {
      renderGroup()

      act(() => {
        for (const x of [10, 20, 30]) {
          window.dispatchEvent(
            new PointerEvent('pointermove', { clientX: x, clientY: x })
          )
        }
      })
      expect(card().style.getPropertyValue('--spot-x')).toBe('')

      frames()
      expect(card().style.getPropertyValue('--spot-x')).toBe('30.0')
    })

    it('does not run the auto loop', () => {
      renderGroup()
      setVisible(true)

      frames(20)

      expect(spotY()).toBe('')
    })
  })

  describe('on a touch device', () => {
    beforeEach(() => {
      stubMedia({ touch: true })
    })

    it('drives the light itself once the group is on screen', () => {
      renderGroup()
      setVisible(true)

      frames()
      const first = spotY()
      expect(first).not.toBe('')

      frames(20)
      expect(spotY()).not.toBe(first)
    })

    it('stays idle until the group scrolls into view', () => {
      renderGroup()

      frames(20)

      expect(spotY()).toBe('')
    })

    it('stops driving once the group scrolls away', () => {
      renderGroup()
      setVisible(true)
      frames(5)

      const beforeHiding = spotY()
      expect(beforeHiding).not.toBe('')

      setVisible(false)
      frames(20)

      expect(spotY()).toBe(beforeHiding)
    })

    it('ignores the pointer', () => {
      renderGroup()

      movePointerTo(420, 240)

      expect(card().style.getPropertyValue('--spot-x')).toBe('')
    })

    it('holds still when the user prefers reduced motion', () => {
      stubMedia({ touch: true, reducedMotion: true })

      renderGroup()
      setVisible(true)
      frames(20)

      expect(spotY()).toBe('')
    })
  })

  it('stops tracking once unmounted', () => {
    const { unmount } = renderGroup()

    movePointerTo(100, 100)
    expect(card().style.getPropertyValue('--spot-x')).toBe('100.0')

    const detached = card()
    unmount()

    expect(() => movePointerTo(200, 200)).not.toThrow()
    expect(detached.style.getPropertyValue('--spot-x')).toBe('100.0')
  })
})

describe('SpotlightCard', () => {
  it('renders its children and carries the spotlight hooks', () => {
    render(
      <SpotlightCard className="p-6" data-testid="spot-card">
        conteúdo
      </SpotlightCard>
    )

    const element = screen.getByTestId('spot-card')
    expect(element).toHaveClass('spotlight-card')
    expect(element).toHaveClass('p-6')
    expect(element).toHaveAttribute('data-spotlight-card')
  })
})
