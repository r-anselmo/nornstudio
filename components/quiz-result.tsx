'use client'

import { useEffect, useRef } from 'react'
import { ContactTrigger } from '@/components/contact-trigger'
import { QuizGauge } from '@/components/quiz-gauge'
import { QuizHorizonChart } from '@/components/quiz-horizon-chart'
import { QuizInsightCard } from '@/components/quiz-insight-card'
import { QuizPhaseBars } from '@/components/quiz-phase-bars'
import { QuizShareButton } from '@/components/quiz-share-button'
import { Reveal } from '@/components/ui/reveal'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import { SpotlightGroup } from '@/components/ui/spotlight-card'
import {
  quizBottlenecksHeading,
  quizContextLine,
  quizCtaBody,
  quizCtaBodyPerfect,
  quizCtaTitle,
  quizNoStrengthsMessage,
  quizPerfectHeadline,
  quizPerfectSupportText,
  quizProfileHeading,
  quizRestartLabel,
  quizResultEyebrow,
  quizStrengthsHeading,
  quizTalkLabel,
} from '@/lib/quiz'
import { buildContactMessage } from '@/lib/quiz-message'
import { STAGGER_MS } from '@/lib/motion'
import { chosenStageAndGoal } from '@/lib/quiz-questions'
import {
  STRENGTH_MIN_SCORE,
  bandFor,
  highlights,
  isPerfectScore,
  phaseResults,
  totalScore,
} from '@/lib/quiz-score'

const sectionHeadingClass =
  'font-heading text-sm font-black uppercase tracking-[0.1em] text-platinum-gray'

export function QuizResult({
  answers,
  onRestart,
}: {
  answers: readonly number[]
  onRestart: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The option button that held focus was unmounted with the last question
    // and nothing else catches it, so focus falls to <body>: the next Tab
    // starts from the top of the document and a screen reader never hears that
    // the result arrived.
    headingRef.current?.focus()
  }, [])

  const results = phaseResults(answers)
  const score = totalScore(results)
  const band = bandFor(score)
  const { strengths, bottlenecks } = highlights(results)
  const isPerfect = isPerfectScore(results)
  const { stage, goal } = chosenStageAndGoal(answers)

  const message = buildContactMessage(answers)

  return (
    <div className="flex flex-col gap-12">
      <SectionEyebrow>{quizResultEyebrow}</SectionEyebrow>

      {/* Stays static, not wrapped in Reveal: the effect above moves focus to
          the heading on mount, and focusing an element still at opacity 0 is
          worse than the missing entrance motion. Same tradeoff as the badge
          row in site-footer.tsx. */}
      <div className="rounded-2xl border border-alabaster/10 bg-alabaster/5 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <QuizGauge score={score} />
          <div className="min-w-56 flex-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-heading text-2xl font-black leading-tight text-alabaster focus:outline-none md:text-3xl"
            >
              {band.name}
            </h1>
            <p className="mt-3 max-w-lg font-body text-sm text-platinum-gray">
              {band.description}
            </p>
          </div>
        </div>
        <p className="mt-8 font-body text-xs text-platinum-gray">
          {quizContextLine(stage, goal)}
        </p>
      </div>

      <Reveal>
        <section className="flex flex-col gap-5">
          <h2 className={sectionHeadingClass}>{quizProfileHeading}</h2>
          <QuizPhaseBars results={results} />
        </section>
      </Reveal>

      <Reveal delay={STAGGER_MS}>
        <section className="flex flex-col gap-5">
          <h2 className={sectionHeadingClass}>{quizStrengthsHeading}</h2>
          {strengths.length > 0 ? (
            <SpotlightGroup className="grid gap-4 md:grid-cols-2">
              {strengths.map((result) => (
                <QuizInsightCard key={result.name} result={result} tone="strength" />
              ))}
            </SpotlightGroup>
          ) : (
            <p className="font-body text-sm text-platinum-gray">
              {quizNoStrengthsMessage(STRENGTH_MIN_SCORE)}
            </p>
          )}
        </section>
      </Reveal>

      <Reveal delay={STAGGER_MS * 2}>
        <section className="flex flex-col gap-5">
          {isPerfect ? (
            <>
              <h2 className="font-heading text-xl font-black leading-tight text-alabaster md:text-2xl">
                {quizPerfectHeadline}
              </h2>
              <p className="font-body text-sm text-platinum-gray">
                {quizPerfectSupportText}
              </p>
            </>
          ) : (
            <>
              <h2 className={sectionHeadingClass}>{quizBottlenecksHeading}</h2>
              <SpotlightGroup className="grid gap-4">
                {bottlenecks.map((result) => (
                  <QuizInsightCard
                    key={result.name}
                    result={result}
                    tone="bottleneck"
                  />
                ))}
              </SpotlightGroup>
            </>
          )}
        </section>
      </Reveal>

      <Reveal delay={STAGGER_MS * 3}>
        <QuizHorizonChart
          score={score}
          bottleneck={bottlenecks[0] ?? null}
          isPerfect={isPerfect}
        />
      </Reveal>

      <Reveal delay={STAGGER_MS * 4}>
        <div className="rounded-2xl border border-lime/40 bg-alabaster/5 p-6 md:p-8">
          <p className="font-heading text-xl font-black leading-tight text-alabaster md:text-2xl">
            {quizCtaTitle}
          </p>
          <p className="mt-4 max-w-xl font-body text-sm text-platinum-gray">
            {isPerfect ? quizCtaBodyPerfect : quizCtaBody}
          </p>
          <div className="mt-7 flex flex-wrap items-start gap-3">
            <ContactTrigger
              message={message}
              className="focus-ring w-fit rounded-full bg-lime px-7 py-3.5 font-heading text-base font-black text-carbon-black transition-colors duration-instant hover:bg-lime/90 motion-reduce:transition-none"
            >
              {quizTalkLabel}
            </ContactTrigger>
            <QuizShareButton answers={answers} />
            <button
              type="button"
              onClick={onRestart}
              className="focus-ring w-fit rounded-full border border-alabaster/15 px-6 py-3.5 font-body text-sm font-medium text-alabaster transition-colors duration-instant hover:border-platinum-gray motion-reduce:transition-none"
            >
              {quizRestartLabel}
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
