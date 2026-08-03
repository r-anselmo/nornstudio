'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { isTouchDevice } from '@/lib/is-touch-device'

/**
 * Publishes the pointer position as `--pointer-x` / `--pointer-y` so every
 * `SpotlightCard` beneath it can inherit them.
 *
 * The coordinates are viewport-relative on purpose. The cards paint their
 * gradients with `background-attachment: fixed`, so they all share one
 * coordinate space and the highlight reads as a single light source passing
 * over the group rather than four independent glows.
 */
export function SpotlightGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = groupRef.current
    if (!element) return
    // The CSS is behind the same (hover: hover) and (pointer: fine) query, so
    // on touch there is nothing to drive and no reason to listen.
    if (isTouchDevice()) return

    let frameId = 0
    let pending: { x: number; y: number } | null = null

    const flush = () => {
      frameId = 0
      if (!pending) return
      element.style.setProperty('--pointer-x', String(pending.x))
      element.style.setProperty('--pointer-y', String(pending.y))
      pending = null
    }

    const handlePointerMove = (event: PointerEvent) => {
      // Pointer events fire far faster than the display refreshes; coalescing
      // into one frame keeps this to a single style write per paint.
      pending = { x: event.clientX, y: event.clientY }
      if (!frameId) frameId = requestAnimationFrame(flush)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div ref={groupRef} data-testid="spotlight-group" className={className}>
      {children}
    </div>
  )
}

export function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`spotlight-card ${className}`}>{children}</div>
}
