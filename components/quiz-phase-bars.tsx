'use client'

import type { PhaseResult } from '@/lib/quiz-score'
import { scoreOpacity } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

export function QuizPhaseBars({ results }: { results: readonly PhaseResult[] }) {
  const armed = useArmed()

  return (
    <ul className="flex flex-col gap-3">
      {results.map((result, index) => (
        <li key={result.name} className="flex items-center gap-3 md:gap-4">
          <span className="w-28 shrink-0 font-body text-xs text-platinum-gray md:w-52 md:text-sm">
            {result.name}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-alabaster/10">
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
          <span className="w-8 shrink-0 text-right font-body text-xs text-platinum-gray">
            {result.score}
          </span>
        </li>
      ))}
    </ul>
  )
}
