import { QUESTION_COUNT, optionCountAt } from '@/lib/quiz-questions'

/**
 * Bumped whenever a question or its options change. Without it a link shared
 * before the change would still decode — onto different answers — and show a
 * result its author never got.
 */
const FORMAT_VERSION = '1'

export const SHARE_PARAM = 'r'

/**
 * One digit per question. Safe because the widest question offers five
 * options; a question with ten would need a different alphabet.
 */
export function encodeAnswers(answers: readonly number[]): string {
  return FORMAT_VERSION + answers.join('')
}

export function decodeAnswers(value: string | null): number[] | null {
  if (!value) return null
  if (value.length !== FORMAT_VERSION.length + QUESTION_COUNT) return null
  if (!value.startsWith(FORMAT_VERSION)) return null

  const digits = value.slice(FORMAT_VERSION.length)
  if (!/^[0-9]+$/.test(digits)) return null

  const answers = [...digits].map(Number)
  const inRange = answers.every((answer, index) => answer < optionCountAt(index))

  return inRange ? answers : null
}

export function readSharedAnswers(search: string): number[] | null {
  return decodeAnswers(new URLSearchParams(search).get(SHARE_PARAM))
}

/**
 * Built from `location` rather than from `siteUrl`: the GitHub Pages build
 * serves the site under a `/nornstudio` basePath, which a hardcoded origin
 * would drop and hand the visitor a 404.
 */
export function buildShareUrl(answers: readonly number[]): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}?${SHARE_PARAM}=${encodeAnswers(answers)}`
}
