import { describe, it, expect } from 'vitest'
import {
  SHARE_PARAM,
  buildShareUrl,
  decodeAnswers,
  encodeAnswers,
  readSharedAnswers,
} from './quiz-share'
import { QUESTION_COUNT } from './quiz-questions'

const answers = [3, 4, 0, 1, 2, 3, 0, 1, 2, 3, 0]

describe('encodeAnswers / decodeAnswers', () => {
  it('round trips a complete answer set', () => {
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers)
  })

  it('stamps the format version so old links fail closed', () => {
    const encoded = encodeAnswers(answers)

    expect(encoded).toHaveLength(QUESTION_COUNT + 1)
    expect(encoded.startsWith('1')).toBe(true)
    expect(decodeAnswers(`9${encoded.slice(1)}`)).toBeNull()
  })

  it('rejects a link of the wrong length', () => {
    expect(decodeAnswers('1030')).toBeNull()
    expect(decodeAnswers(`${encodeAnswers(answers)}0`)).toBeNull()
  })

  it('rejects anything that is not digits', () => {
    expect(decodeAnswers('1abcdefghijk')).toBeNull()
    expect(decodeAnswers('1 0000000000')).toBeNull()
  })

  it('rejects an option that does not exist for its question', () => {
    // Twelve characters each: the version digit plus eleven answers.
    // Question 0 offers four options, so a 4 in the first slot is out of range…
    expect(decodeAnswers('140000000000')).toBeNull()
    // …while question 1 offers five, so a 4 in the second slot is legitimate.
    expect(decodeAnswers('104000000000')).toEqual([
      0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ])
  })

  it('rejects empty input', () => {
    expect(decodeAnswers('')).toBeNull()
    expect(decodeAnswers(null)).toBeNull()
  })
})

describe('readSharedAnswers', () => {
  it('reads the answers out of a query string', () => {
    expect(readSharedAnswers(`?${SHARE_PARAM}=${encodeAnswers(answers)}`)).toEqual(
      answers
    )
  })

  it('returns null when the parameter is absent or junk', () => {
    expect(readSharedAnswers('')).toBeNull()
    expect(readSharedAnswers('?foo=bar')).toBeNull()
    expect(readSharedAnswers(`?${SHARE_PARAM}=lixo`)).toBeNull()
  })
})

describe('buildShareUrl', () => {
  it('builds the link from the current location, basePath included', () => {
    window.history.replaceState({}, '', '/nornstudio/quiz/')

    expect(buildShareUrl(answers)).toBe(
      `${window.location.origin}/nornstudio/quiz/?${SHARE_PARAM}=${encodeAnswers(answers)}`
    )
  })
})
