'use client'

import { useChatConversation } from '@/components/chat-conversation'
import { phaseReached, railFill } from '@/lib/chat-rail-progress'
import type { RailPhase } from '@/lib/chat-rail-progress'

// Module scope, not inside ChatPhaseRail: react-hooks/static-components is
// error-level here.
function RailNode({ step, reached }: { step: string; reached: boolean }) {
  return (
    <div className="flex items-center gap-3" data-testid="rail-node" data-state={reached ? 'complete' : 'pending'}>
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-500 motion-reduce:transition-none ${
          reached ? 'bg-lime' : 'bg-alabaster/25'
        }`}
      />
      <span
        className={`font-body text-xs font-medium tracking-[0.02em] transition-colors duration-500 motion-reduce:transition-none ${
          reached ? 'text-lime' : 'text-platinum-gray/50'
        }`}
      >
        {step}
      </span>
    </div>
  )
}

/**
 * Vertical progress rail for the chat thread, one equal segment per phase.
 *
 * Decorative: the phase names live in the thread's own `<h3>` dividers, so this
 * carries only the numbers and is hidden from assistive technology. It exists
 * to occupy the dead gutter beside the thread on wide screens and to show how
 * far through the process the conversation has got.
 *
 * Phase counts arrive as props rather than being imported here. `chatPhases`
 * is currently in zero client bundles, and importing it would ship all twelve
 * messages of copy to the browser to duplicate what the HTML already contains.
 */
export function ChatPhaseRail({
  phases,
  className = '',
}: {
  phases: RailPhase[]
  className?: string
}) {
  const conversation = useChatConversation()

  // Not armed means every message is already visible — the static export, and
  // anyone with reduced motion. The rail has to read complete, not stalled.
  const armed = conversation?.armed ?? false
  const revealedCount = conversation?.revealedCount ?? 0
  const fill = armed ? railFill(revealedCount, phases) : 1

  return (
    <div
      data-testid="chat-phase-rail"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-0 w-12 ${className}`}
    >
      <div className="sticky top-32">
        <div className="relative flex h-80 flex-col justify-between">
          <span className="absolute bottom-1 left-1 top-1 w-px -translate-x-1/2 bg-alabaster/15" />
          <span
            // Remounted when `armed` flips so there is no previous height to
            // transition from. Without this the bar animates a 700ms drain from
            // full to empty on page load, when arming resets the cursor to zero.
            key={armed ? 'armed' : 'idle'}
            data-testid="rail-fill"
            style={{ height: `${fill * 100}%` }}
            className="absolute left-1 top-1 w-px -translate-x-1/2 rounded-full bg-lime transition-[height] duration-700 ease-out motion-reduce:transition-none"
          />
          {phases.map((phase, index) => (
            <RailNode
              key={phase.step}
              step={phase.step}
              reached={!armed || phaseReached(revealedCount, phases, index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
