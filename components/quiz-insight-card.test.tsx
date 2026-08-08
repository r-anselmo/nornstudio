import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizInsightCard } from './quiz-insight-card'
import { phaseResults } from '@/lib/quiz-score'
import { quizActionLabel, quizPointsLabel, quizWhyLabel } from '@/lib/quiz'

const result = phaseResults([0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0])[0]

describe('QuizInsightCard', () => {
  it('titles the card with the phase and its score', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    expect(
      screen.getByRole('heading', { level: 3, name: result.name })
    ).toBeInTheDocument()
    expect(screen.getByText(quizPointsLabel(100))).toBeInTheDocument()
  })

  it('explains why the phase matters', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    expect(screen.getByText(quizWhyLabel)).toBeInTheDocument()
    expect(screen.getByText(result.principle)).toBeInTheDocument()
  })

  it('withholds the next step from a strength', () => {
    render(<QuizInsightCard result={result} tone="strength" />)

    // The action is remedial copy. On something that already works it reads
    // as a correction the visitor did not earn.
    expect(screen.queryByText(quizActionLabel)).toBeNull()
    expect(screen.queryByText(result.action)).toBeNull()
  })

  it('gives a bottleneck its next step', () => {
    render(<QuizInsightCard result={result} tone="bottleneck" />)

    expect(screen.getByText(quizActionLabel)).toBeInTheDocument()
    expect(screen.getByText(result.action)).toBeInTheDocument()
  })

  it('marks a bottleneck with the lime edge', () => {
    const { container } = render(
      <QuizInsightCard result={result} tone="bottleneck" />
    )

    expect(container.querySelector('[data-spotlight-card]')?.className).toContain(
      'border-lime/40'
    )
  })
})
