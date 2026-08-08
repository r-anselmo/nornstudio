import { describe, it, expect } from 'vitest'
import {
  FIRST_PHASE_INDEX,
  QUESTION_COUNT,
  contextQuestion,
  goalQuestion,
  optionCountAt,
  phases,
  questionAt,
} from './quiz-questions'

describe('quiz questions', () => {
  it('asks eleven questions: two of context, nine of phase', () => {
    expect(phases).toHaveLength(9)
    expect(QUESTION_COUNT).toBe(11)
    expect(FIRST_PHASE_INDEX).toBe(2)
  })

  it('gives every phase exactly four options', () => {
    // The option index IS the score in lib/quiz-score.ts. A phase with three
    // or five options would score silently wrong rather than fail.
    for (const phase of phases) {
      expect(phase.options).toHaveLength(4)
    }
  })

  it('gives the context question four options and the goal question five', () => {
    expect(contextQuestion.options).toHaveLength(4)
    expect(goalQuestion.options).toHaveLength(5)
  })

  it('reports the option count for every question index', () => {
    expect(optionCountAt(0)).toBe(4)
    expect(optionCountAt(1)).toBe(5)
    for (let index = FIRST_PHASE_INDEX; index < QUESTION_COUNT; index++) {
      expect(optionCountAt(index)).toBe(4)
    }
  })

  it('resolves a question from its index', () => {
    expect(questionAt(0).question).toBe(contextQuestion.question)
    expect(questionAt(1).question).toBe(goalQuestion.question)
    expect(questionAt(2).question).toBe(phases[0].question)
    expect(questionAt(10).question).toBe(phases[8].question)
  })

  it('carries no empty copy', () => {
    // The source mock was mis-encoded; a bad paste drops text rather than
    // erroring, and an empty option renders as an unlabelled button.
    for (const phase of phases) {
      expect(phase.tag.length).toBeGreaterThan(0)
      expect(phase.name.length).toBeGreaterThan(0)
      expect(phase.question.length).toBeGreaterThan(0)
      expect(phase.principle.length).toBeGreaterThan(0)
      expect(phase.action.length).toBeGreaterThan(0)
      for (const option of phase.options) {
        expect(option.length).toBeGreaterThan(0)
      }
    }
  })

  it('names every phase uniquely', () => {
    // Names are React keys and the identity used to exclude a strength from
    // the bottlenecks.
    expect(new Set(phases.map((phase) => phase.name)).size).toBe(phases.length)
  })
})
