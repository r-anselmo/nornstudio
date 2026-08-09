import { describe, it, expect } from 'vitest'
import {
  MAX_BOTTLENECKS,
  MAX_STRENGTHS,
  MIN_SCORE_OPACITY,
  bandFor,
  highlights,
  isComplete,
  isPerfectScore,
  phaseResults,
  scoreOpacity,
  totalScore,
} from './quiz-score'
import { QUESTION_COUNT, phases } from './quiz-questions'
import { quizBands } from './quiz'

/** Eleven answers where every phase takes the same option. */
function answersWith(option: number): number[] {
  return [0, 0, ...Array<number>(phases.length).fill(option)]
}

describe('isComplete', () => {
  it('rejects an unfinished quiz', () => {
    const answers: (number | null)[] = Array(QUESTION_COUNT).fill(null)
    answers[0] = 1
    expect(isComplete(answers)).toBe(false)
  })

  it('rejects an array of the wrong length', () => {
    expect(isComplete([0, 1, 2])).toBe(false)
  })

  it('accepts eleven answered questions', () => {
    expect(isComplete(answersWith(3))).toBe(true)
  })
})

describe('phaseResults', () => {
  it('scores each phase from its option index', () => {
    const results = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])

    expect(results).toHaveLength(9)
    expect(results.map((result) => result.score)).toEqual([
      0, 33, 66, 100, 0, 33, 66, 100, 0,
    ])
  })

  it('keeps the phase copy alongside the score', () => {
    const results = phaseResults(answersWith(3))

    expect(results[0].name).toBe(phases[0].name)
    expect(results[0].principle).toBe(phases[0].principle)
    expect(results[0].action).toBe(phases[0].action)
  })
})

describe('totalScore', () => {
  it('is 0 when every phase takes the weakest option', () => {
    expect(totalScore(phaseResults(answersWith(0)))).toBe(0)
  })

  it('is 100 when every phase takes the strongest option', () => {
    expect(totalScore(phaseResults(answersWith(3)))).toBe(100)
  })

  it('rounds the mean of the nine phases', () => {
    // Eight at 0 and one at 100 → 100/9 = 11.11…
    const results = phaseResults([0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(totalScore(results)).toBe(11)
  })
})

describe('bandFor', () => {
  it('places a score in the band whose ceiling it does not exceed', () => {
    expect(bandFor(0).name).toBe(quizBands[0].name)
    expect(bandFor(25).name).toBe(quizBands[0].name)
    expect(bandFor(26).name).toBe(quizBands[1].name)
    expect(bandFor(50).name).toBe(quizBands[1].name)
    expect(bandFor(51).name).toBe(quizBands[2].name)
    expect(bandFor(75).name).toBe(quizBands[2].name)
    expect(bandFor(76).name).toBe(quizBands[3].name)
    expect(bandFor(100).name).toBe(quizBands[3].name)
  })
})

describe('highlights', () => {
  it('finds no bottleneck when every phase is at the top', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(3)))

    // The mock still printed three "gargalos" cards here, each reading 100 pts.
    expect(bottlenecks).toEqual([])
    expect(strengths).toHaveLength(MAX_STRENGTHS)
    expect(strengths.every((result) => result.score === 100)).toBe(true)
  })

  it('finds no strength when every phase is at the bottom', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(0)))

    expect(strengths).toEqual([])
    expect(bottlenecks).toHaveLength(MAX_BOTTLENECKS)
  })

  it('never lists the same phase as both a strength and a bottleneck', () => {
    // Every phase tied at 66 is the case that broke the mock: it is eligible
    // for both lists at once.
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(2)))

    const strengthNames = strengths.map((result) => result.name)
    const overlap = bottlenecks.filter((result) =>
      strengthNames.includes(result.name)
    )
    expect(overlap).toEqual([])
    expect(strengths).toHaveLength(MAX_STRENGTHS)
    expect(bottlenecks).toHaveLength(MAX_BOTTLENECKS)
  })

  it('breaks ties by phase order, so a shared link is deterministic', () => {
    const { strengths, bottlenecks } = highlights(phaseResults(answersWith(2)))

    expect(strengths.map((result) => result.name)).toEqual([
      phases[0].name,
      phases[1].name,
    ])
    expect(bottlenecks.map((result) => result.name)).toEqual([
      phases[2].name,
      phases[3].name,
      phases[4].name,
    ])
  })

  it('ranks strengths highest first and bottlenecks lowest first', () => {
    // Phases 0..8 take options 0,1,2,3,3,2,1,0,3 → 0,33,66,100,100,66,33,0,100
    const results = phaseResults([0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 3])
    const { strengths, bottlenecks } = highlights(results)

    expect(strengths.map((result) => result.score)).toEqual([100, 100])
    expect(strengths.map((result) => result.name)).toEqual([
      phases[3].name,
      phases[4].name,
    ])
    expect(bottlenecks.map((result) => result.score)).toEqual([0, 0, 33])
    expect(bottlenecks.map((result) => result.name)).toEqual([
      phases[0].name,
      phases[7].name,
      phases[1].name,
    ])
  })
})

describe('isPerfectScore', () => {
  it('is true when every phase takes the strongest option', () => {
    expect(isPerfectScore(phaseResults(answersWith(3)))).toBe(true)
  })

  it('is false when even one phase is short of the top', () => {
    const results = phaseResults([0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2])
    expect(isPerfectScore(results)).toBe(false)
  })

  it('agrees with highlights() finding zero bottlenecks', () => {
    const results = phaseResults(answersWith(3))
    expect(isPerfectScore(results)).toBe(
      highlights(results).bottlenecks.length === 0
    )
  })
})

describe('scoreOpacity', () => {
  it('never fades a bar out completely', () => {
    expect(scoreOpacity(0)).toBe(MIN_SCORE_OPACITY)
  })

  it('reaches full strength at 100', () => {
    expect(scoreOpacity(100)).toBe(1)
  })

  it('rises with the score', () => {
    expect(scoreOpacity(50)).toBeGreaterThan(scoreOpacity(0))
    expect(scoreOpacity(100)).toBeGreaterThan(scoreOpacity(50))
  })
})
