import { contextQuestion, goalQuestion } from '@/lib/quiz-questions'
import type { PhaseResult } from '@/lib/quiz-score'

/**
 * What the contact dialog opens pre-filled with. A lead that arrives carrying
 * its own diagnosis is worth answering differently from one that says only
 * "quero conversar" — and the visitor can edit every word before sending.
 */
export function buildContactMessage({
  answers,
  score,
  band,
  bottlenecks,
}: {
  answers: readonly number[]
  score: number
  band: string
  bottlenecks: readonly PhaseResult[]
}): string {
  const stage = contextQuestion.options[answers[0]]
  const goal = goalQuestion.options[answers[1]]

  const gaps = bottlenecks.length
    ? `Meus gargalos:\n${bottlenecks
        .map((result) => `- ${result.name} (${result.score} pts)`)
        .join('\n')}`
    : 'Nenhum gargalo apareceu abaixo de 66 pontos.'

  return [
    `Fiz o diagnóstico de growth e tirei ${score}/100 (${band}).`,
    `Estágio: ${stage}`,
    `Meta: ${goal}`,
    gaps,
    'Quero me aprofundar nisso.',
  ].join('\n\n')
}
