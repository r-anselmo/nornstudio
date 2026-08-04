import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiquidEtherBackground } from './liquid-ether-background'

const { liquidEtherMock } = vi.hoisted(() => ({
  liquidEtherMock: vi.fn<(props: unknown) => null>(() => null),
}))

vi.mock('@/components/LiquidEther', () => ({
  default: (props: unknown) => liquidEtherMock(props),
}))

/**
 * The old stub answered every query the same way, which cannot express
 * "touch device that does not want motion" — the case that matters most here.
 */
function stubMedia({
  reducedMotion = false,
  touch = false,
}: {
  reducedMotion?: boolean
  touch?: boolean
}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : touch,
    }))
  )
}

describe('LiquidEtherBackground', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    liquidEtherMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function settle() {
    act(() => {
      vi.advanceTimersByTime(0)
    })
  }

  it('enables auto demo on devices with no hover and a coarse pointer', () => {
    stubMedia({ touch: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: true })
    )
  })

  it('keeps auto demo off on devices with a mouse', () => {
    stubMedia({ touch: false })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: false })
    )
  })

  it('renders a static wash instead of the fluid under reduced motion', () => {
    stubMedia({ reducedMotion: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(screen.getByTestId('liquid-ether-static')).toBeInTheDocument()
    // Never mounted, not mounted-then-torn-down: WebGL context creation is
    // the expensive part and reduced-motion visitors should not pay it.
    expect(liquidEtherMock).not.toHaveBeenCalled()
  })

  it('respects reduced motion even on a touch device', () => {
    stubMedia({ reducedMotion: true, touch: true })

    render(<LiquidEtherBackground />)
    settle()

    expect(liquidEtherMock).not.toHaveBeenCalled()
  })
})
