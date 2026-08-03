'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { User } from 'lucide-react'
import type { ChatSender } from '@/lib/chat-flow-script'
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'

const TYPING_DURATION_MS = 700

/**
 * 'initial' renders the bubble with no animation classes. It is what the server
 * emits and what the first client render produces, so hydration matches and the
 * copy is always in the DOM. Everything after it is opt-in motion.
 */
type RevealPhase = 'initial' | 'hidden' | 'typing' | 'shown'

const dotDelays = ['0ms', '150ms', '300ms']

export function ChatTypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {dotDelays.map((delay, index) => (
        <span
          key={delay}
          // Inline style, not `delay-*`: Tailwind core's delay utilities shadow
          // tw-animate-css and emit transition-delay, not animation-delay.
          style={{ animationDelay: delay }}
          className={`h-1.5 w-1.5 rounded-full motion-reduce:animate-none animate-pulse ${
            index === dotDelays.length - 1 ? 'bg-lime' : 'bg-platinum-gray'
          }`}
        />
      ))}
    </span>
  )
}

export function ChatAvatar({ sender }: { sender: ChatSender }) {
  if (sender === 'norn') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime">
        <span className="font-heading text-lg font-black text-carbon-black">
          N
        </span>
      </span>
    )
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-alabaster/10">
      <User className="h-4 w-4 text-platinum-gray" aria-hidden="true" />
    </span>
  )
}

export type ChatMessageRowProps = {
  sender: ChatSender
  delayMs: number
  children: ReactNode
  footer?: ReactNode
}

export function ChatMessageRow({
  sender,
  delayMs,
  children,
  footer,
}: ChatMessageRowProps) {
  const [phase, setPhase] = useState<RevealPhase>('initial')
  // The observer watches this stable wrapper, never the bubble: the bubble
  // subtree is swapped out during 'typing' and would detach the observed node.
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = rowRef.current
    if (!element) return

    let typingTimeoutId: ReturnType<typeof setTimeout> | undefined
    let observer: IntersectionObserver | undefined

    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const armTimeoutId = setTimeout(() => {
      // Bail out before touching state so no-motion and no-observer environments
      // never schedule an update at all.
      if (prefersReducedMotion()) return
      if (typeof IntersectionObserver === 'undefined') return

      setPhase('hidden')

      // Created after the setPhase above, in the same callback: attaching it in
      // the effect body lets the observer's first entry race ahead of the pending
      // arm and strand the row at 'hidden' forever.
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer?.disconnect()

          if (sender === 'norn') {
            setPhase('typing')
            typingTimeoutId = setTimeout(
              () => setPhase('shown'),
              TYPING_DURATION_MS
            )
            return
          }

          setPhase('shown')
        },
        { threshold: 0, rootMargin: '0px 0px -15% 0px' }
      )
      observer.observe(element)
    }, 0)

    return () => {
      clearTimeout(armTimeoutId)
      clearTimeout(typingTimeoutId)
      observer?.disconnect()
    }
  }, [sender])

  const isNorn = sender === 'norn'

  // Full class literals per branch: Tailwind's scanner cannot resolve
  // template-built names like `slide-in-from-${side}-4`.
  const revealClass =
    phase === 'hidden'
      ? 'opacity-0'
      : phase === 'shown'
        ? isNorn
          ? 'animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both'
          : 'animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both'
        : ''

  return (
    <div
      ref={rowRef}
      data-testid="chat-row"
      data-phase={phase}
      style={phase === 'shown' ? { animationDelay: `${delayMs}ms` } : undefined}
      className={`flex items-end gap-3 ${isNorn ? 'flex-row-reverse' : ''} ${revealClass}`}
    >
      <ChatAvatar sender={sender} />
      <div
        className={`flex min-w-0 flex-col gap-2 ${isNorn ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`relative max-w-[80%] rounded-2xl bg-alabaster/10 px-4 py-2.5 font-body text-sm leading-relaxed text-alabaster ${
            isNorn ? 'border-r-2 border-r-lime' : ''
          }`}
        >
          {/* Kept mounted (just invisible) while typing so the row holds its
              height and nothing below it jumps when the text lands. */}
          <div className={phase === 'typing' ? 'invisible' : undefined}>
            {children}
          </div>
          {phase === 'typing' && (
            <span className="absolute inset-0 flex items-center px-4">
              <ChatTypingDots />
            </span>
          )}
        </div>
        {footer}
      </div>
    </div>
  )
}
