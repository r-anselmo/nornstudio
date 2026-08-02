'use client'

import { useEffect, useState } from 'react'
import { formatClockTime } from '@/lib/format-time'

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(formatClockTime(new Date()))
    const timeoutId = setTimeout(update, 0)
    const intervalId = setInterval(update, 1000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  if (time === null) {
    return null
  }

  return (
    <div className="flex items-center gap-2 font-body text-sm font-medium tracking-[0.02em] text-alabaster">
      <span className="h-2 w-2 rounded-full bg-lime" />
      <span>LIVE · {time}</span>
    </div>
  )
}
