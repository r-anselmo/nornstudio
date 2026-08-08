import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { GAUGE_CIRCUMFERENCE, QuizGauge } from './quiz-gauge'
import { quizGaugeLabel } from '@/lib/quiz'
import { MIN_SCORE_OPACITY } from '@/lib/quiz-score'

describe('QuizGauge', () => {
  it('names the score for assistive technology', () => {
    render(<QuizGauge score={72} />)

    expect(
      screen.getByRole('img', { name: quizGaugeLabel(72) })
    ).toBeInTheDocument()
  })

  it('prints the number as text too, not only as a ring', () => {
    render(<QuizGauge score={72} />)

    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('starts with the ring empty, before useArmed flips on the next frame', () => {
    render(<QuizGauge score={50} />)

    // useArmed (lib/use-armed.ts) stays false until the frame after mount, so
    // the very first paint must offset the ring by the full circumference —
    // an empty ring — or the transition has no start state to run from and
    // never visibly draws in.
    expect(screen.getByTestId('quiz-gauge-fill')).toHaveAttribute(
      'stroke-dashoffset',
      String(GAUGE_CIRCUMFERENCE)
    )
  })

  it('draws the ring in proportion to the score', async () => {
    render(<QuizGauge score={50} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-gauge-fill')).toHaveAttribute(
        'stroke-dashoffset',
        String(GAUGE_CIRCUMFERENCE / 2)
      )
    )
  })

  it('closes the ring completely at 100', async () => {
    render(<QuizGauge score={100} />)

    await waitFor(() =>
      expect(screen.getByTestId('quiz-gauge-fill')).toHaveAttribute(
        'stroke-dashoffset',
        '0'
      )
    )
  })

  it('keeps a weak score visible instead of turning it red', () => {
    render(<QuizGauge score={0} />)

    const ring = screen.getByTestId('quiz-gauge-fill')
    expect(ring.getAttribute('class')).toContain('stroke-lime')
    expect(Number(ring.getAttribute('stroke-opacity'))).toBe(MIN_SCORE_OPACITY)
  })

  it('holds still for anyone who asked for less motion', () => {
    render(<QuizGauge score={50} />)

    expect(screen.getByTestId('quiz-gauge-fill').getAttribute('class')).toContain(
      'motion-reduce:transition-none'
    )
  })
})
