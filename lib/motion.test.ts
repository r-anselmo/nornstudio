import { describe, it, expect, afterEach } from 'vitest'
import { MOTION_GATE_CLASS, isMotionEnabled } from './motion'

afterEach(() => {
  document.documentElement.classList.remove(MOTION_GATE_CLASS)
})

describe('isMotionEnabled', () => {
  it('is false until the gate class is present', () => {
    expect(isMotionEnabled()).toBe(false)
  })

  it('is true once the head script has added the gate class', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    expect(isMotionEnabled()).toBe(true)
  })
})
