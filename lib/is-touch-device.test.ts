import { describe, it, expect, afterEach, vi } from 'vitest'
import { isTouchDevice } from './is-touch-device'

describe('isTouchDevice', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when the device has no hover and a coarse pointer', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true })
    )

    expect(isTouchDevice()).toBe(true)
  })

  it('returns false when the device has hover and a fine pointer', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false })
    )

    expect(isTouchDevice()).toBe(false)
  })

  it('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)

    expect(isTouchDevice()).toBe(false)
  })
})
