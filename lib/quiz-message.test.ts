import { describe, it, expect } from 'vitest'
import { buildContactMessage } from './quiz-message'
import { phaseResults } from './quiz-score'
import { contextQuestion, goalQuestion, phases } from './quiz-questions'

const answers = [2, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3]

describe('buildContactMessage', () => {
  it('opens with the score and the band', () => {
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks: [],
    })

    expect(message).toContain('55/100')
    expect(message).toContain('Crescimento com direção')
  })

  it('carries the stage and the goal the visitor chose', () => {
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks: [],
    })

    expect(message).toContain(contextQuestion.options[2])
    expect(message).toContain(goalQuestion.options[1])
  })

  it('lists every bottleneck with its score', () => {
    const bottlenecks = phaseResults(answers).slice(0, 3)
    const message = buildContactMessage({
      answers,
      score: 55,
      band: 'Crescimento com direção',
      bottlenecks,
    })

    for (const bottleneck of bottlenecks) {
      expect(message).toContain(bottleneck.name)
    }
    expect(message).toContain(`${phases[0].name} (0 pts)`)
  })

  it('says so plainly when there is no bottleneck to report', () => {
    const message = buildContactMessage({
      answers,
      score: 100,
      band: 'Crescimento em loop',
      bottlenecks: [],
    })

    expect(message).toContain('Nenhum gargalo')
  })
})
