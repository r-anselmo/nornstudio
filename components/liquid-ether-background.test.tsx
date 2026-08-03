import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { LiquidEtherBackground } from './liquid-ether-background'

const { liquidEtherMock } = vi.hoisted(() => ({
  liquidEtherMock: vi.fn<(props: unknown) => null>(() => null),
}))

vi.mock('@/components/LiquidEther', () => ({
  default: (props: unknown) => liquidEtherMock(props),
}))

describe('LiquidEtherBackground', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('enables auto demo on devices with no hover and a coarse pointer', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true })
    )

    render(<LiquidEtherBackground />)
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: true })
    )
  })

  it('keeps auto demo off on devices with a mouse', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false })
    )

    render(<LiquidEtherBackground />)
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(liquidEtherMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoDemo: false })
    )
  })
})
