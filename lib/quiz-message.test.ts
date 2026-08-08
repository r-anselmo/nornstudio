import { describe, it, expect } from 'vitest'
import { buildContactMessage } from './quiz-message'
import { bandFor, highlights, phaseResults, totalScore } from './quiz-score'
import { contextQuestion, goalQuestion, phases } from './quiz-questions'

const answers = [2, 1, 0, 0, 0, 3, 3, 3, 3, 3, 3]
const results = phaseResults(answers)
const score = totalScore(results)
const band = bandFor(score)
const { bottlenecks } = highlights(results)

describe('buildContactMessage', () => {
  it('opens with the score and the band', () => {
    const message = buildContactMessage(answers)

    // Derived from `answers`, not passed in — a caller cannot hand the
    // function a score that disagrees with the answers it came with.
    expect(message).toContain(`${score}/100`)
    expect(message).toContain(band.name)
  })

  it('carries the stage and the goal the visitor chose', () => {
    const message = buildContactMessage(answers)

    expect(message).toContain(contextQuestion.options[2])
    expect(message).toContain(goalQuestion.options[1])
  })

  it('lists every bottleneck with its score, one per line', () => {
    const message = buildContactMessage(answers)

    expect(bottlenecks.length).toBeGreaterThan(0)
    for (const bottleneck of bottlenecks) {
      expect(message).toContain(`${bottleneck.name} (${bottleneck.score} pts)`)
    }
    expect(message).toContain(`${phases[0].name} (0 pts)`)

    // Formatting is the deliverable here: a wrong separator (', ' instead of
    // '\n') would still satisfy every toContain assertion above while
    // shipping the gargalos as a run-on line.
    const gapsBlock = message
      .split('\n\n')
      .find((block) => block.startsWith('Meus gargalos:'))
    expect(gapsBlock).toBe(
      [
        'Meus gargalos:',
        ...bottlenecks.map((result) => `- ${result.name} (${result.score} pts)`),
      ].join('\n')
    )
  })

  it('separates the score, stage, goal, gaps and closing line into distinct blocks', () => {
    const message = buildContactMessage(answers)

    // A wrong join (' ' instead of '\n\n') would still pass every
    // toContain assertion above while shipping as a wall of run-on text.
    const blocks = message.split('\n\n')
    expect(blocks).toHaveLength(5)
    expect(blocks[blocks.length - 1]).toBe('Quero me aprofundar nisso.')
  })

  it('says so plainly when there is no bottleneck to report', () => {
    // Every phase at its strongest option — no phase scores low enough to be
    // a bottleneck.
    const perfectAnswers = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    const message = buildContactMessage(perfectAnswers)

    expect(message).toContain('Nenhum gargalo')
  })
})
