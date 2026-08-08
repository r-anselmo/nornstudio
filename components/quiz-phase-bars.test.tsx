import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QuizPhaseBars } from './quiz-phase-bars'
import { phaseResults } from '@/lib/quiz-score'
import { phases } from '@/lib/quiz-questions'

const results = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])

describe('QuizPhaseBars', () => {
  it('names every phase', () => {
    render(<QuizPhaseBars results={results} />)

    for (const phase of phases) {
      expect(screen.getByText(phase.name)).toBeInTheDocument()
    }
  })

  it('prints the number beside each bar, not only the fill', () => {
    render(<QuizPhaseBars results={results} />)

    // Opacity and length are both easy to misread; the figure is not.
    expect(screen.getAllByText('100').length).toBeGreaterThan(0)
    expect(screen.getAllByText('33').length).toBeGreaterThan(0)
  })

  it('starts every bar empty, before useArmed flips on the next frame', () => {
    render(<QuizPhaseBars results={results} />)

    // useArmed (lib/use-armed.ts) stays false until the frame after mount, so
    // the very first paint must render every bar at 0% width — even one whose
    // score is not zero — or the transition has no start state to run from
    // and never visibly draws in. quiz-bar-0's score is genuinely 0, so it
    // would read '0%' either way; quiz-bar-3 (score 100) is the bar that
    // actually distinguishes "armed is false" from "armed never ran".
    expect(screen.getByTestId('quiz-bar-3')).toHaveStyle({ width: '0%' })
  })

  it('grows each bar to its score', async () => {
    render(<QuizPhaseBars results={results} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-bar-3')).toHaveStyle({ width: '100%' })
    )
    expect(screen.getByTestId('quiz-bar-0')).toHaveStyle({ width: '0%' })
  })

  it('stays lime at every score', () => {
    render(<QuizPhaseBars results={results} />)

    const weakest = screen.getByTestId('quiz-bar-0')
    expect(weakest.className).toContain('bg-lime')
    expect(weakest.className).toContain('motion-reduce:transition-none')
  })
})
