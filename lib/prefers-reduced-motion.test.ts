import { describe, it, expect, afterEach, vi } from 'vitest'
import { prefersReducedMotion } from './prefers-reduced-motion'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the user asked for reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when the user has no motion preference', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)

    expect(prefersReducedMotion()).toBe(false)
  })

  it('queries the reduced motion media feature', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', matchMedia)

    prefersReducedMotion()

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
