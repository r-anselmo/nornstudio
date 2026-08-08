import { SpotlightCard } from '@/components/ui/spotlight-card'
import { quizActionLabel, quizPointsLabel, quizWhyLabel } from '@/lib/quiz'
import type { PhaseResult } from '@/lib/quiz-score'

/**
 * One phase, framed either way. A strength gets the principle only: the action
 * copy is remedial, and printing it under something that already works reads
 * as a correction rather than a confirmation.
 *
 * Full class literals per tone rather than an interpolated string — Tailwind's
 * scanner cannot resolve names built at runtime.
 */
const tones = {
  strength: 'border-alabaster/10',
  bottleneck: 'border-lime/40',
} as const

export function QuizInsightCard({
  result,
  tone,
}: {
  result: PhaseResult
  tone: keyof typeof tones
}) {
  return (
    <SpotlightCard
      className={`flex h-full flex-col gap-3 rounded-2xl border bg-alabaster/5 p-6 ${tones[tone]}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-lg font-black text-alabaster">
          {result.name}
        </h3>
        <span className="shrink-0 font-body text-xs tracking-[0.02em] text-platinum-gray">
          {quizPointsLabel(result.score)}
        </span>
      </div>

      <p className="font-body text-sm text-platinum-gray">
        <strong className="font-medium text-alabaster">{quizWhyLabel}</strong>{' '}
        {result.principle}
      </p>

      {tone === 'bottleneck' && (
        <div className="mt-auto border-l-2 border-lime bg-lime/5 px-4 py-3">
          <span className="block font-body text-[10px] font-medium uppercase tracking-[0.08em] text-lime">
            {quizActionLabel}
          </span>
          <p className="mt-1 font-body text-sm text-alabaster">{result.action}</p>
        </div>
      )}
    </SpotlightCard>
  )
}
