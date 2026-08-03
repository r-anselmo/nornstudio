import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SpotlightCard, SpotlightGroup } from './spotlight-card'

function movePointerTo(x: number, y: number) {
  act(() => {
    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: x, clientY: y })
    )
  })
  act(() => {
    vi.advanceTimersToNextFrame()
  })
}

describe('SpotlightGroup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders its children', () => {
    render(
      <SpotlightGroup>
        <span>serviços</span>
      </SpotlightGroup>
    )

    expect(screen.getByText('serviços')).toBeInTheDocument()
  })

  it('publishes the pointer position for its cards to inherit', () => {
    render(
      <SpotlightGroup>
        <SpotlightCard>card</SpotlightCard>
      </SpotlightGroup>
    )

    const group = screen.getByTestId('spotlight-group')
    expect(group.style.getPropertyValue('--pointer-x')).toBe('')

    movePointerTo(420, 240)

    expect(group.style.getPropertyValue('--pointer-x')).toBe('420')
    expect(group.style.getPropertyValue('--pointer-y')).toBe('240')
  })

  it('coalesces a burst of pointer moves into a single frame', () => {
    render(<SpotlightGroup>{null}</SpotlightGroup>)
    const group = screen.getByTestId('spotlight-group')

    act(() => {
      for (const x of [10, 20, 30]) {
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: x, clientY: x })
        )
      }
    })
    // Nothing is written until the frame runs.
    expect(group.style.getPropertyValue('--pointer-x')).toBe('')

    act(() => {
      vi.advanceTimersToNextFrame()
    })
    expect(group.style.getPropertyValue('--pointer-x')).toBe('30')
  })

  it('does not track the pointer on touch devices', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    render(<SpotlightGroup>{null}</SpotlightGroup>)
    const group = screen.getByTestId('spotlight-group')

    movePointerTo(420, 240)

    expect(group.style.getPropertyValue('--pointer-x')).toBe('')
  })

  it('stops tracking once unmounted', () => {
    const { unmount } = render(<SpotlightGroup>{null}</SpotlightGroup>)
    const group = screen.getByTestId('spotlight-group')

    movePointerTo(100, 100)
    expect(group.style.getPropertyValue('--pointer-x')).toBe('100')

    unmount()

    // Would throw on a detached node write if the listener were still attached.
    expect(() => movePointerTo(200, 200)).not.toThrow()
    expect(group.style.getPropertyValue('--pointer-x')).toBe('100')
  })
})

describe('SpotlightCard', () => {
  it('renders its children and carries the spotlight class', () => {
    render(<SpotlightCard className="p-6">conteúdo</SpotlightCard>)

    const card = screen.getByText('conteúdo')
    expect(card).toHaveClass('spotlight-card')
    expect(card).toHaveClass('p-6')
  })
})
