'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { isTouchDevice } from '@/lib/is-touch-device'
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'

/** Horizontal sweep across the group, in cycles per second. */
const AUTO_SWEEP_SPEED = 0.55
/** How far across the group width the sweep reaches, either side of centre. */
const AUTO_SWEEP_REACH = 0.42
/** Vertical drift on top of the viewport centre, in pixels and cycles/second. */
const AUTO_DRIFT_PX = 48
const AUTO_DRIFT_SPEED = 0.9

type Light = { x: number; y: number }

/**
 * Positions a lime highlight over every `SpotlightCard` beneath it.
 *
 * The light is a single position in the group's own coordinate space, which
 * each card then receives translated into its own box as `--spot-x` /
 * `--spot-y`. One light, four windows onto it — so it reads as one source
 * passing over the group rather than four independent glows.
 *
 * Card-local coordinates rather than viewport ones with
 * `background-attachment: fixed`: Safari on iOS does not honour fixed
 * attachment and paints those gradients as if they scrolled, which would put
 * the highlight in the wrong place on exactly the devices auto mode exists
 * for.
 */
export function SpotlightGroup({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Offsets are relative to the group (it is `relative`), so unlike viewport
    // rects they only change on layout, never on scroll.
    let cards: Array<{ element: HTMLElement; left: number; top: number }> = []
    const measure = () => {
      cards = Array.from(
        group.querySelectorAll<HTMLElement>('[data-spotlight-card]')
      ).map((element) => ({
        element,
        left: element.offsetLeft,
        top: element.offsetTop,
      }))
    }

    const paint = (light: Light) => {
      for (const { element, left, top } of cards) {
        element.style.setProperty('--spot-x', (light.x - left).toFixed(1))
        element.style.setProperty('--spot-y', (light.y - top).toFixed(1))
      }
    }

    measure()
    window.addEventListener('resize', measure)

    let frameId = 0
    const cleanups: Array<() => void> = [
      () => window.removeEventListener('resize', measure),
      () => {
        if (frameId) cancelAnimationFrame(frameId)
      },
    ]

    if (isTouchDevice()) {
      // No pointer to follow, so drive the light ourselves — the same auto mode
      // the hero's LiquidEther falls back to on touch.
      if (!prefersReducedMotion()) {
        const drawAutoFrame = (time: number) => {
          frameId = requestAnimationFrame(drawAutoFrame)

          const seconds = time / 1000
          const rect = group.getBoundingClientRect()

          paint({
            x:
              (0.5 + AUTO_SWEEP_REACH * Math.sin(seconds * AUTO_SWEEP_SPEED)) *
              rect.width,
            // Anchored to the middle of the viewport so the light stays on
            // whatever card is being read, with a slow drift so it never sits
            // perfectly still.
            y:
              window.innerHeight / 2 -
              rect.top +
              Math.sin(seconds * AUTO_DRIFT_SPEED) * AUTO_DRIFT_PX,
          })
        }

        // Runs only while the section is on screen, matching how LiquidEther
        // parks its render loop.
        if (typeof IntersectionObserver !== 'undefined') {
          const observer = new IntersectionObserver(
            (entries) => {
              const visible = entries.some((entry) => entry.isIntersecting)
              if (visible && !frameId) {
                frameId = requestAnimationFrame(drawAutoFrame)
                return
              }
              if (!visible && frameId) {
                cancelAnimationFrame(frameId)
                frameId = 0
              }
            },
            { threshold: 0 }
          )
          observer.observe(group)
          cleanups.push(() => observer.disconnect())
        } else {
          frameId = requestAnimationFrame(drawAutoFrame)
        }
      }
    } else {
      let pending: Light | null = null

      const drawPointerFrame = () => {
        frameId = 0
        if (!pending) return
        // One rect read per frame for the group, not one per card.
        const rect = group.getBoundingClientRect()
        paint({ x: pending.x - rect.left, y: pending.y - rect.top })
        pending = null
      }

      const handlePointerMove = (event: PointerEvent) => {
        // Pointer events outpace the display; coalescing into a frame keeps
        // this to one style write per card per paint.
        pending = { x: event.clientX, y: event.clientY }
        if (!frameId) frameId = requestAnimationFrame(drawPointerFrame)
      }

      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })
      cleanups.push(() =>
        window.removeEventListener('pointermove', handlePointerMove)
      )
    }

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }, [])

  return (
    <div
      ref={groupRef}
      data-testid="spotlight-group"
      className={`relative ${className}`}
    >
      {children}
    </div>
  )
}

export function SpotlightCard({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-spotlight-card className={`spotlight-card ${className}`} {...props}>
      {children}
    </div>
  )
}
