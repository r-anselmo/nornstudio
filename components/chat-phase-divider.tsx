'use client'

import { useChatConversation } from '@/components/chat-conversation'

/**
 * The `NN · LABEL` rule between phases, dimmed until the conversation gets
 * there. This is the progress cue at every width — the rail beside the thread
 * only appears once there is a gutter to put it in.
 */
export function ChatPhaseDivider({
  step,
  label,
  reachedAt,
}: {
  step: string
  label: string
  /** Cursor position at which this phase's first message has resolved. */
  reachedAt: number
}) {
  const conversation = useChatConversation()

  // Not armed means everything is already visible, so nothing may look pending.
  const reached =
    !conversation?.armed || conversation.revealedCount >= reachedAt

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-px flex-1 bg-alabaster/15" />
      <h3
        // Full literals per branch: Tailwind cannot scan a templated name.
        className={`font-body text-xs font-medium tracking-[0.02em] transition-colors duration-500 motion-reduce:transition-none ${
          reached ? 'text-lime' : 'text-platinum-gray'
        }`}
      >
        {step} · {label}
      </h3>
      <span aria-hidden="true" className="h-px flex-1 bg-alabaster/15" />
    </div>
  )
}
