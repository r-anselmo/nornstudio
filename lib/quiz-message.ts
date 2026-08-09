import { chosenStageAndGoal } from '@/lib/quiz-questions'
import {
  BOTTLENECK_MAX_SCORE,
  bandFor,
  highlights,
  phaseResults,
  totalScore,
} from '@/lib/quiz-score'

/**
 * What the contact dialog opens pre-filled with. A lead that arrives carrying
 * its own diagnosis is worth answering differently from one that says only
 * "quero conversar" — and the visitor can edit every word before sending.
 *
 * Takes only `answers` and derives score, band and bottlenecks itself,
 * through the same pure functions the result screen uses. A caller cannot
 * hand this a score that disagrees with the answers it came with — the
 * mismatch this exists to prevent is unrepresentable rather than merely
 * unlikely.
 *
 * Assumes `answers` is complete and every entry in range for its question —
 * the same precondition `isComplete` in `lib/quiz-score.ts` narrows to, and
 * the only state in which this may be called. Not enforced here: the result
 * screen only ever builds `answers` one in-range click at a time, and a
 * shared link is range-validated by `decodeAnswers` before it reaches this
 * far.
 */
export function buildContactMessage(answers: readonly number[]): string {
  const results = phaseResults(answers)
  const score = totalScore(results)
  const band = bandFor(score)
  const { bottlenecks } = highlights(results)

  const { stage, goal } = chosenStageAndGoal(answers)

  const gaps = bottlenecks.length
    ? `Meus gargalos:\n${bottlenecks
        .map((result) => `- ${result.name} (${result.score} pts)`)
        .join('\n')}`
    : `Nenhum gargalo apareceu abaixo de ${BOTTLENECK_MAX_SCORE} pontos.`

  return [
    `Fiz o diagnóstico de growth e tirei ${score}/100 (${band.name}).`,
    `Estágio: ${stage}`,
    `Meta: ${goal}`,
    gaps,
    'Quero me aprofundar nisso.',
  ].join('\n\n')
}
