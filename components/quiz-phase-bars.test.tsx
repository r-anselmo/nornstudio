import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { QuizPhaseBars } from './quiz-phase-bars'
import { phaseResults, scoreOpacity } from '@/lib/quiz-score'
import { phases } from '@/lib/quiz-questions'
import { quizPhaseScoreLabel } from '@/lib/quiz'

const results = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])

describe('QuizPhaseBars', () => {
  it('names every phase', () => {
    render(<QuizPhaseBars results={results} />)

    for (const phase of phases) {
      expect(screen.getByText(phase.name)).toBeInTheDocument()
    }
  })

  it('names each row for assistive technology, with the score attached', () => {
    render(<QuizPhaseBars results={results} />)

    // Mirrors quiz-gauge.tsx's role="img" + aria-label: a row's name, track
    // and number are aria-hidden, and this is the one statement a screen
    // reader gets instead. Without it a row reads as three unlabelled pieces
    // ("De onde vem o motor" … "100") with nothing saying the number is that
    // phase's score, out of 100.
    expect(
      screen.getByRole('img', {
        name: quizPhaseScoreLabel(results[1].name, results[1].score),
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: quizPhaseScoreLabel(results[3].name, results[3].score),
      })
    ).toBeInTheDocument()
  })

  it('pairs each phase with its own score, not just any number on the page', () => {
    render(<QuizPhaseBars results={results} />)

    // getAllByText('100') / getAllByText('33') would still pass if scores
    // were shuffled onto the wrong phases, as long as the same set of
    // numbers appeared somewhere in the list. Reading the name and the
    // number from the same row is what actually proves the pairing.
    const rows = screen.getAllByRole('listitem')
    expect(within(rows[1]).getByText(results[1].name)).toBeInTheDocument()
    expect(within(rows[1]).getByText('33')).toBeInTheDocument()
    expect(within(rows[3]).getByText(results[3].name)).toBeInTheDocument()
    expect(within(rows[3]).getByText('100')).toBeInTheDocument()
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

  it('fades a weak bar instead of hiding it, per scoreOpacity', () => {
    render(<QuizPhaseBars results={results} />)

    // components/quiz-gauge.test.tsx asserts stroke-opacity the same way for
    // the ring; the bars have their own opacity to lose if scoreOpacity ever
    // stops being called, or gets inverted.
    expect(screen.getByTestId('quiz-bar-0')).toHaveStyle({
      opacity: String(scoreOpacity(0)),
    })
    expect(screen.getByTestId('quiz-bar-3')).toHaveStyle({
      opacity: String(scoreOpacity(100)),
    })
  })
})
