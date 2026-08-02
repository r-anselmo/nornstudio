import { describe, it, expect } from 'vitest'
import { formatClockTime } from './format-time'

describe('formatClockTime', () => {
  it('pads single-digit hours, minutes, and seconds with zeros', () => {
    expect(formatClockTime(new Date(2026, 0, 1, 9, 5, 3))).toBe('09:05:03')
  })

  it('formats double-digit values without extra padding', () => {
    expect(formatClockTime(new Date(2026, 0, 1, 17, 2, 13))).toBe('17:02:13')
  })
})
