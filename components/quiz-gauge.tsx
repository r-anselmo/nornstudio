'use client'

import { quizGaugeLabel, quizScaleLabel } from '@/lib/quiz'
import { scoreOpacity } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

const RADIUS = 64

/** Rounded so the dash offsets land on whole numbers. */
export const GAUGE_CIRCUMFERENCE = Math.round(2 * Math.PI * RADIUS)

/**
 * `role="img"` with the score in the label: the ring is one shape and reads as
 * one thing, and everything inside it is decoration repeating what the label
 * already says.
 */
export function QuizGauge({ score }: { score: number }) {
  const armed = useArmed()
  const offset = armed ? GAUGE_CIRCUMFERENCE * (1 - score / 100) : GAUGE_CIRCUMFERENCE

  return (
    <div
      role="img"
      aria-label={quizGaugeLabel(score)}
      className="relative h-36 w-36 shrink-0 md:h-40 md:w-40"
    >
      <svg viewBox="0 0 150 150" aria-hidden="true" className="h-full w-full -rotate-90">
        <circle
          cx="75"
          cy="75"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className="stroke-alabaster/10"
        />
        <circle
          data-testid="quiz-gauge-fill"
          cx="75"
          cy="75"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeOpacity={scoreOpacity(score)}
          className="stroke-lime transition-[stroke-dashoffset] duration-deliberate ease-out-expo motion-reduce:transition-none"
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-heading text-4xl font-black leading-none text-lime">
          {score}
        </span>
        <span className="mt-1 font-body text-xs text-platinum-gray">
          {quizScaleLabel}
        </span>
      </div>
    </div>
  )
}
