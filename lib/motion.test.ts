import { describe, it, expect, afterEach } from 'vitest'
import {
  MOTION_GATE_CLASS,
  MOTION_GATE_TIMEOUT_MS,
  MOTION_HYDRATED_FLAG,
  isMotionEnabled,
  motionGateScript,
} from './motion'

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

describe('motionGateScript', () => {
  it('gates on both reduced motion and IntersectionObserver', () => {
    expect(motionGateScript).toContain('prefers-reduced-motion: reduce')
    expect(motionGateScript).toContain('IntersectionObserver')
  })

  it('adds the same class the CSS and isMotionEnabled key off', () => {
    expect(motionGateScript).toContain(MOTION_GATE_CLASS)
  })

  it('withdraws the gate if hydration never reports in', () => {
    // Otherwise a bundle that fails to load leaves the CSS hiding content
    // that nothing is left alive to reveal.
    expect(motionGateScript).toContain(MOTION_HYDRATED_FLAG)
    expect(motionGateScript).toContain(String(MOTION_GATE_TIMEOUT_MS))
  })
})
