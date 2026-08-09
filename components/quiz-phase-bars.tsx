'use client'

import { quizPhaseScoreLabel } from '@/lib/quiz'
import type { PhaseResult } from '@/lib/quiz-score'
import { scoreOpacity } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

/**
 * Each row is an `<li>` (so the nine rows still read as a list of nine) whose
 * visible name/track/number are `aria-hidden` and replaced, for assistive
 * technology, by one `role="img"` + `aria-label` — the same pattern
 * `quiz-gauge.tsx` uses for the ring. Without it a row announces as three
 * unlabelled pieces ("De onde vem o motor" … "100") with nothing tying the
 * number to the name or saying it is a score out of 100.
 */
export function QuizPhaseBars({ results }: { results: readonly PhaseResult[] }) {
  const armed = useArmed()

  return (
    <ul className="flex flex-col gap-3">
      {results.map((result, index) => (
        <li key={result.name}>
          <div
            role="img"
            aria-label={quizPhaseScoreLabel(result.name, result.score)}
            className="flex items-center gap-3 md:gap-4"
          >
            <span
              aria-hidden="true"
              className="w-28 shrink-0 font-body text-xs leading-tight text-platinum-gray md:w-60 md:text-sm"
            >
              {result.name}
            </span>
            <span
              aria-hidden="true"
              className="h-2 flex-1 overflow-hidden rounded-full bg-alabaster/10"
            >
              {/* Width and opacity are runtime values, so they cannot be
                  Tailwind classes — the scanner only sees literals. */}
              <span
                data-testid={`quiz-bar-${index}`}
                style={{
                  width: armed ? `${result.score}%` : '0%',
                  opacity: scoreOpacity(result.score),
                }}
                className="block h-full rounded-full bg-lime transition-[width] duration-deliberate ease-out-expo motion-reduce:transition-none"
              />
            </span>
            <span
              aria-hidden="true"
              className="w-8 shrink-0 text-right font-body text-xs text-platinum-gray"
            >
              {result.score}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
