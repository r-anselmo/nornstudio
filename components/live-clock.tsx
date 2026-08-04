'use client'

import { useEffect, useState } from 'react'
import { formatClockTime } from '@/lib/format-time'

/** Same shape as HH:MM:SS, so the header does not reflow when the time lands. */
const PLACEHOLDER = '--:--:--'

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    // Deferred into timer callbacks (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const update = () => setTime(formatClockTime(new Date()))
    const timeoutId = setTimeout(update, 0)
    const intervalId = setInterval(update, 1000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.02em] tabular-nums text-alabaster">
      {/* Dimmed until the clock is live, so the placeholder does not read as a
          real reading. */}
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-base ${
          time === null ? 'bg-alabaster/30' : 'bg-lime'
        }`}
      />
      <span>LIVE · {time ?? PLACEHOLDER}</span>
    </div>
  )
}
