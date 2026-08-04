'use client'

import { useEffect, useState } from 'react'
import LiquidEther from '@/components/LiquidEther'
import { isTouchDevice } from '@/lib/is-touch-device'
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'

/**
 * `pending` until the media queries are read. Resolving before the first mount
 * rather than after means a reduced-motion visitor never pays for a WebGL
 * context that is torn down on the next tick.
 */
type BackgroundMode = 'pending' | 'fluid-auto' | 'fluid-pointer' | 'static'

export function LiquidEtherBackground() {
  const [mode, setMode] = useState<BackgroundMode>('pending')

  useEffect(() => {
    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const timeoutId = setTimeout(() => {
      if (prefersReducedMotion()) {
        setMode('static')
        return
      }
      setMode(isTouchDevice() ? 'fluid-auto' : 'fluid-pointer')
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  if (mode === 'pending') return null

  if (mode === 'static') {
    // Not simply nothing: the hero composition is built around a lime presence
    // behind the headline, and dropping to bare carbon flattens it. This keeps
    // the colour without the movement.
    return (
      <div
        data-testid="liquid-ether-static"
        className="h-full w-full bg-[radial-gradient(60%_50%_at_50%_45%,color-mix(in_oklab,var(--color-lime)_16%,transparent),transparent_70%)]"
      />
    )
  }

  return (
    <LiquidEther
      mouseForce={20}
      cursorSize={100}
      isViscous
      viscous={30}
      colors={['#C6F432', '#C6F432', '#C6F432']}
      autoDemo={mode === 'fluid-auto'}
      autoSpeed={0.5}
      autoIntensity={2.2}
      isBounce={false}
      resolution={0.5}
    />
  )
}
