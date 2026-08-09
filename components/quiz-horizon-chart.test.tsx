import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QuizHorizonChart } from './quiz-horizon-chart'
import {
  quizHorizonAxisLabels,
  quizHorizonBottleneckText,
  quizHorizonChartLabel,
  quizHorizonDisclaimer,
  quizHorizonLegendAlone,
  quizHorizonLegendWithNorn,
  quizPerfectSupportText,
} from '@/lib/quiz'
import { phaseResults } from '@/lib/quiz-score'
import {
  horizonPathD,
  horizonPathLength,
  horizonWithNornPoints,
} from '@/lib/quiz-horizon'

const bottleneck = phaseResults([0, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0])[0]

describe('QuizHorizonChart', () => {
  it('names the illustration for assistive technology', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    expect(
      screen.getByRole('img', { name: quizHorizonChartLabel(42) })
    ).toBeInTheDocument()
  })

  it('shows a legend for both lines', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    expect(screen.getByText(quizHorizonLegendAlone)).toBeInTheDocument()
    expect(screen.getByText(quizHorizonLegendWithNorn)).toBeInTheDocument()
  })

  it('shows all five time-axis labels', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    for (const label of quizHorizonAxisLabels) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('always shows the not-a-projection disclaimer', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    expect(screen.getByText(quizHorizonDisclaimer)).toBeInTheDocument()
  })

  it('names the biggest bottleneck when the score is not perfect', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    expect(
      screen.getByText(quizHorizonBottleneckText(bottleneck.name))
    ).toBeInTheDocument()
  })

  it('shows the shared success text when the score is perfect', () => {
    render(<QuizHorizonChart score={100} bottleneck={null} isPerfect={true} />)

    expect(screen.getByText(quizPerfectSupportText)).toBeInTheDocument()
  })

  it('draws the "com a Norn" line along the same geometry lib/quiz-horizon computes', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    const points = horizonWithNornPoints(42)
    expect(screen.getByTestId('quiz-horizon-norn-path')).toHaveAttribute(
      'd',
      horizonPathD(points)
    )
  })

  it('starts the "com a Norn" line fully hidden, before useArmed flips on the next frame', () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    const length = horizonPathLength(horizonWithNornPoints(42))
    expect(screen.getByTestId('quiz-horizon-norn-path')).toHaveAttribute(
      'stroke-dashoffset',
      String(length)
    )
  })

  it('draws the "com a Norn" line in fully once armed', async () => {
    render(
      <QuizHorizonChart score={42} bottleneck={bottleneck} isPerfect={false} />
    )

    await waitFor(() =>
      expect(screen.getByTestId('quiz-horizon-norn-path')).toHaveAttribute(
        'stroke-dashoffset',
        '0'
      )
    )
  })
})
