'use client'

import { useEffect, useState } from 'react'
import LiquidEther from '@/components/LiquidEther'
import { isTouchDevice } from '@/lib/is-touch-device'

export function LiquidEtherBackground() {
  const [autoDemo, setAutoDemo] = useState(false)

  useEffect(() => {
    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const timeoutId = setTimeout(() => setAutoDemo(isTouchDevice()), 0)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <LiquidEther
      mouseForce={20}
      cursorSize={100}
      isViscous
      viscous={30}
      colors={['#C6F432', '#C6F432', '#C6F432']}
      autoDemo={autoDemo}
      autoSpeed={0.5}
      autoIntensity={2.2}
      isBounce={false}
      resolution={0.5}
    />
  )
}
