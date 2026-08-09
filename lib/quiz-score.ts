import { quizBands } from '@/lib/quiz'
import type { QuizBand } from '@/lib/quiz'
import { FIRST_PHASE_INDEX, QUESTION_COUNT, phases } from '@/lib/quiz-questions'
import type { QuizPhase } from '@/lib/quiz-questions'

/** Option index → score. Four options per phase, weakest to strongest. */
const PHASE_SCORES = [0, 33, 66, 100]

/** At or above this, a phase is something to protect. */
export const STRENGTH_MIN_SCORE = 66
/** At or below this, a phase is something to work on. */
export const BOTTLENECK_MAX_SCORE = 66

// Exported (unlike PHASE_SCORES above) because quiz-score.test.ts asserts
// against them directly, so the cap in the test and the cap `highlights`
// enforces can never drift apart.
export const MAX_STRENGTHS = 2
export const MAX_BOTTLENECKS = 3

/** A bar at zero still has to be visible, or the row reads as missing. */
export const MIN_SCORE_OPACITY = 0.4

export type PhaseResult = QuizPhase & { score: number }

/**
 * Narrows the reducer's `(number | null)[]` once every question is answered,
 * which is the only state in which anything below may be called.
 */
export function isComplete(
  answers: readonly (number | null)[]
): answers is number[] {
  return (
    answers.length === QUESTION_COUNT &&
    answers.every((answer) => answer !== null)
  )
}

export function phaseResults(answers: readonly number[]): PhaseResult[] {
  return phases.map((phase, index) => ({
    ...phase,
    score: PHASE_SCORES[answers[index + FIRST_PHASE_INDEX]] ?? 0,
  }))
}

export function totalScore(results: readonly PhaseResult[]): number {
  const sum = results.reduce((total, result) => total + result.score, 0)
  return Math.round(sum / results.length)
}

export function bandFor(score: number): QuizBand {
  return (
    quizBands.find((band) => score <= band.maxScore) ??
    quizBands[quizBands.length - 1]
  )
}

/**
 * The two lists the result screen shows, computed together so they cannot
 * overlap — the mock derived them from independent sorts and printed the same
 * phase as both a strength and a bottleneck whenever scores tied.
 *
 * `sort` is stable, and `results` arrives in phase order, so equal scores keep
 * their 00 → 08 order. That is what makes a shared link render identically
 * every time it is opened.
 */
export function highlights(results: readonly PhaseResult[]): {
  strengths: PhaseResult[]
  bottlenecks: PhaseResult[]
} {
  const strengths = [...results]
    .filter((result) => result.score >= STRENGTH_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_STRENGTHS)

  const claimed = new Set(strengths.map((result) => result.name))

  const bottlenecks = [...results]
    .filter(
      (result) =>
        result.score <= BOTTLENECK_MAX_SCORE && !claimed.has(result.name)
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_BOTTLENECKS)

  return { strengths, bottlenecks }
}

/**
 * How solid a bar or the gauge ring paints. Norn has no red, so a weak score
 * cannot change hue the way the source mock did — it stays lime and loses
 * opacity. Every bar prints its number too, because opacity alone is not a
 * safe carrier of meaning.
 */
export function scoreOpacity(score: number): number {
  const opacity = MIN_SCORE_OPACITY + (1 - MIN_SCORE_OPACITY) * (score / 100)
  return Number(opacity.toFixed(2))
}
