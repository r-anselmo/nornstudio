'use client'

import {
  quizHorizonAxisLabels,
  quizHorizonBottleneckText,
  quizHorizonChartLabel,
  quizHorizonDisclaimer,
  quizHorizonHeading,
  quizHorizonLegendAlone,
  quizHorizonLegendWithNorn,
  quizHorizonYouAreHere,
  quizPerfectSupportText,
} from '@/lib/quiz'
import {
  HORIZON_VIEW_HEIGHT,
  HORIZON_VIEW_WIDTH,
  horizonAlonePoints,
  horizonCeilingY,
  horizonPathD,
  horizonPathLength,
  horizonStartY,
  horizonWithNornPoints,
  horizonXPositions,
} from '@/lib/quiz-horizon'
import type { PhaseResult } from '@/lib/quiz-score'
import { useArmed } from '@/lib/use-armed'

const sectionHeadingClass =
  'font-heading text-sm font-black uppercase tracking-[0.1em] text-platinum-gray'

export function QuizHorizonChart({
  score,
  bottleneck,
  isPerfect,
}: {
  score: number
  bottleneck: PhaseResult | null
  isPerfect: boolean
}) {
  const armed = useArmed()
  const xPositions = horizonXPositions()
  const startY = horizonStartY(score)
  const ceilingY = horizonCeilingY(score)
  const nornPoints = horizonWithNornPoints(score)
  const nornPathD = horizonPathD(nornPoints)
  const nornLength = horizonPathLength(nornPoints)

  // isPerfect takes priority; otherwise `bottleneck` is always present here
  // — see isPerfectScore's comment in lib/quiz-score.ts for why zero
  // bottlenecks and a perfect score are the same condition.
  const supportText = isPerfect
    ? quizPerfectSupportText
    : bottleneck
      ? quizHorizonBottleneckText(bottleneck.name)
      : ''

  return (
    <section className="flex flex-col gap-5">
      <h2 className={sectionHeadingClass}>{quizHorizonHeading}</h2>

      <div className="rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 md:p-8">
        <div
          role="img"
          aria-label={quizHorizonChartLabel(score)}
          className="relative w-full"
        >
          <svg
            viewBox={`0 0 ${HORIZON_VIEW_WIDTH} ${HORIZON_VIEW_HEIGHT}`}
            aria-hidden="true"
            className="w-full"
          >
            <line
              x1={xPositions[0]}
              y1={ceilingY}
              x2={xPositions[xPositions.length - 1]}
              y2={ceilingY}
              strokeWidth={1.5}
              strokeDasharray="3 5"
              className="stroke-alabaster/15 transition-opacity duration-deliberate ease-out-expo motion-reduce:transition-none"
              style={{ opacity: armed ? 1 : 0 }}
            />
            <path
              data-testid="quiz-horizon-alone-path"
              d={horizonPathD(horizonAlonePoints(score))}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="7 6"
              className="stroke-platinum-gray transition-opacity duration-deliberate ease-out-expo motion-reduce:transition-none"
              style={{ opacity: armed ? 1 : 0 }}
            />
            <path
              data-testid="quiz-horizon-norn-path"
              d={nornPathD}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={nornLength}
              strokeDashoffset={armed ? 0 : nornLength}
              className="stroke-lime transition-[stroke-dashoffset] duration-deliberate ease-out-expo motion-reduce:transition-none"
            />
            <circle cx={xPositions[0]} cy={startY} r={5} className="fill-lime" />
          </svg>

          <span
            aria-hidden="true"
            className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap font-body text-[10px] text-platinum-gray"
            style={{
              left: `${(xPositions[0] / HORIZON_VIEW_WIDTH) * 100}%`,
              top: `${(startY / HORIZON_VIEW_HEIGHT) * 100}%`,
              marginTop: '-8px',
            }}
          >
            {quizHorizonYouAreHere}
          </span>
        </div>

        <div className="mt-2 flex justify-between font-body text-[10px] text-platinum-gray md:text-xs">
          {quizHorizonAxisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 font-body text-xs text-platinum-gray">
            <span
              aria-hidden="true"
              className="h-0 w-4 shrink-0 border-t-2 border-dashed border-platinum-gray"
            />
            {quizHorizonLegendAlone}
          </span>
          <span className="flex items-center gap-2 font-body text-xs text-alabaster">
            <span aria-hidden="true" className="h-0.5 w-4 shrink-0 bg-lime" />
            {quizHorizonLegendWithNorn}
          </span>
        </div>

        <p className="mt-4 font-body text-xs text-platinum-gray/80">
          {quizHorizonDisclaimer}
        </p>
        <p className="mt-3 font-body text-sm text-platinum-gray">{supportText}</p>
      </div>
    </section>
  )
}
