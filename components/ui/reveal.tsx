'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { REVEAL_ROOT_MARGIN, isMotionEnabled } from '@/lib/motion'

/**
 * Fades and rises its children when they enter the viewport, once.
 *
 * The hidden state itself lives in globals.css keyed on `[data-reveal]` and
 * the `js-motion` gate, not here — see the comment in that file for why React
 * state cannot own it without flashing.
 *
 * Wrap block-level groups, not individual grid items. `SpotlightGroup`
 * measures its cards with `offsetLeft`/`offsetTop`, and putting a wrapper
 * around each card changes what those are relative to.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!isMotionEnabled()) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const triggerLine = entry.rootBounds?.bottom
          // Content already scrolled past never reports as intersecting, so
          // check the trigger line directly too. Otherwise a restored scroll
          // position leaves it hidden forever.
          const crossed =
            entry.isIntersecting ||
            (triggerLine !== undefined &&
              entry.boundingClientRect.top < triggerLine)
          if (!crossed) continue

          observer.disconnect()
          setRevealed(true)
          return
        }
      },
      { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal={revealed ? 'visible' : 'pending'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  )
}
