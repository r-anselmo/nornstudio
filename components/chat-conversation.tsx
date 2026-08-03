'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChatSender } from '@/lib/chat-flow-script'
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion'

/** How long Norn "types" before its bubble resolves. */
export const TYPING_MS = 650
/** Beat between a client message and whatever follows it. */
export const CLIENT_BEAT_MS = 220
/** Once the visitor is this many messages ahead, stop pacing and catch up. */
export const CATCHUP_BACKLOG = 3
export const CATCHUP_MS = 70

/**
 * Where a row counts as having arrived. Trimming the bottom of the root box
 * anchors the trigger just inside the lower edge, so a message resolves as it
 * rises into view rather than while it is still off-screen.
 */
export const ENTER_ROOT_MARGIN = '0px 0px -10% 0px'

export type ChatRevealPhase = 'initial' | 'hidden' | 'typing' | 'shown'

type ChatConversationValue = {
  armed: boolean
  phaseFor: (index: number) => ChatRevealPhase
  markEntered: (index: number) => void
}

const ChatConversationContext = createContext<ChatConversationValue | null>(null)

export function useChatConversation() {
  return useContext(ChatConversationContext)
}

/**
 * Owns a single monotonic reveal cursor for the whole conversation.
 *
 * Rows used to run their own timers, so Norn's typing pause let the message
 * after it resolve first and the conversation read out of order. Here scroll
 * only decides how far the cursor may run; the cursor alone decides what
 * resolves next, and it only ever moves forward one message at a time.
 */
export function ChatConversation({
  senders,
  children,
}: {
  senders: ChatSender[]
  children: ReactNode
}) {
  const [armed, setArmed] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [maxEntered, setMaxEntered] = useState(-1)
  const maxEnteredRef = useRef(-1)

  useEffect(() => {
    // Deferred into a timer callback (not called synchronously here) to satisfy the
    // react-hooks/set-state-in-effect lint rule.
    const timeoutId = setTimeout(() => {
      if (prefersReducedMotion()) return
      if (typeof IntersectionObserver === 'undefined') return
      setArmed(true)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const markEntered = useCallback((index: number) => {
    if (index <= maxEnteredRef.current) return
    maxEnteredRef.current = index
    setMaxEntered(index)
  }, [])

  const total = senders.length
  const canAdvance = armed && revealedCount < total && revealedCount <= maxEntered

  useEffect(() => {
    if (!canAdvance) return

    const backlog = maxEnteredRef.current - revealedCount
    const delay =
      backlog >= CATCHUP_BACKLOG
        ? CATCHUP_MS
        : senders[revealedCount] === 'norn'
          ? TYPING_MS
          : CLIENT_BEAT_MS

    const timeoutId = setTimeout(() => setRevealedCount((count) => count + 1), delay)
    return () => clearTimeout(timeoutId)
    // Depends on the `canAdvance` boolean rather than `maxEntered` on purpose:
    // during a fast scroll many rows enter in quick succession, and depending on
    // the number would clear and reschedule this timer each time, so the cursor
    // would never actually advance.
  }, [canAdvance, revealedCount, senders])

  // Dots are for pacing, not for catching up: once the visitor is well ahead,
  // the backlog drains straight through without them.
  const typingIndex =
    canAdvance &&
    senders[revealedCount] === 'norn' &&
    maxEntered - revealedCount < CATCHUP_BACKLOG
      ? revealedCount
      : null

  const phaseFor = useCallback(
    (index: number): ChatRevealPhase => {
      if (!armed) return 'initial'
      if (index < revealedCount) return 'shown'
      if (index === typingIndex) return 'typing'
      return 'hidden'
    },
    [armed, revealedCount, typingIndex]
  )

  return (
    <ChatConversationContext.Provider value={{ armed, phaseFor, markEntered }}>
      {children}
    </ChatConversationContext.Provider>
  )
}
