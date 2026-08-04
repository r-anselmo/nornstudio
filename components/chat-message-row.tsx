'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { User } from 'lucide-react'
import type { ChatSender } from '@/lib/chat-flow-script'
import { ENTER_ROOT_MARGIN, useChatConversation } from '@/components/chat-conversation'
import { NornBadge } from '@/components/ui/norn-badge'

// Offsets tuned to the 1400ms keyframe in globals.css: spread far enough apart
// that the bounce visibly travels along the row rather than the three dots
// moving as one.
const dotDelays = ['0ms', '160ms', '320ms']

export function ChatTypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {dotDelays.map((delay, index) => (
        <span
          key={delay}
          // Inline style, not `delay-*`: Tailwind core's delay utilities shadow
          // tw-animate-css and emit transition-delay, not animation-delay.
          style={{ animationDelay: delay }}
          className={`h-1.5 w-1.5 rounded-full motion-reduce:animate-none animate-chat-typing ${
            index === dotDelays.length - 1 ? 'bg-lime' : 'bg-platinum-gray'
          }`}
        />
      ))}
    </span>
  )
}

export function ChatAvatar({ sender }: { sender: ChatSender }) {
  if (sender === 'norn') {
    // rounded-xl, not the badge default, so it matches the client avatar
    // sitting opposite it in the thread.
    return <NornBadge className="rounded-xl" />
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-alabaster/10">
      <User className="h-4 w-4 text-platinum-gray" aria-hidden="true" />
    </span>
  )
}

export type ChatMessageRowProps = {
  index: number
  sender: ChatSender
  children: ReactNode
  footer?: ReactNode
}

export function ChatMessageRow({
  index,
  sender,
  children,
  footer,
}: ChatMessageRowProps) {
  const conversation = useChatConversation()
  const rowRef = useRef<HTMLDivElement>(null)

  const armed = conversation?.armed ?? false
  const markEntered = conversation?.markEntered
  // Without a provider the row simply stays visible, which is also what the
  // server renders.
  const phase = conversation?.phaseFor(index) ?? 'initial'

  useEffect(() => {
    const element = rowRef.current
    if (!element || !armed || !markEntered) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const triggerLine = entry.rootBounds?.bottom
          // Rows the visitor has already scrolled past never report as
          // intersecting, so check the trigger line directly too. Otherwise a
          // restored scroll position strands the cursor behind them.
          const crossed =
            entry.isIntersecting ||
            (triggerLine !== undefined &&
              entry.boundingClientRect.top < triggerLine)
          if (!crossed) continue

          observer.disconnect()
          markEntered(index)
          return
        }
      },
      { threshold: 0, rootMargin: ENTER_ROOT_MARGIN }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [armed, index, markEntered])

  const isNorn = sender === 'norn'

  // 'typing' and 'shown' deliberately share one class string so the bubble
  // animates in once and does not restart when the text replaces the dots.
  // Full literals per branch: Tailwind's scanner cannot resolve names built
  // from a template like `slide-in-from-${side}-4`.
  const revealClass =
    phase === 'initial'
      ? ''
      : phase === 'hidden'
        ? 'opacity-0'
        : isNorn
          ? 'animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both'
          : 'animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both'

  return (
    <div
      ref={rowRef}
      // A styling hook distinct from the test id: globals.css keys the
      // before-first-paint hidden state off this, and stylesheets should not
      // depend on test selectors.
      data-chat-row=""
      data-testid="chat-row"
      data-phase={phase}
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
