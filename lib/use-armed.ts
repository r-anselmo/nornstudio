'use client'

import { useEffect, useState } from 'react'

/**
 * False on the first paint, true from the next frame.
 *
 * A CSS transition only runs if the browser painted the start state first.
 * The gauge and the bars mount as part of a state transition — the visitor
 * answering the last question — and React can commit that mount and its
 * effects inside a single frame, which paints them already full. One
 * `requestAnimationFrame` guarantees the empty state is on screen first.
 */
export function useArmed(): boolean {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return armed
}
