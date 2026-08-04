import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveClock } from './live-clock'

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 17, 2, 13))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current time after mounting', () => {
    render(<LiveClock />)
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.getByText('LIVE · 17:02:13')).toBeInTheDocument()
  })

  it('updates the displayed time every second', () => {
    render(<LiveClock />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('LIVE · 17:02:14')).toBeInTheDocument()
  })

  it('reserves its width before the time resolves', () => {
    render(<LiveClock />)

    // Rendering nothing until hydration shifts everything beside it in the
    // hero header. The placeholder is the same shape as HH:MM:SS.
    expect(screen.getByText('LIVE · --:--:--')).toBeInTheDocument()
  })
})
