import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizResult } from './quiz-result'
import { ContactDialogProvider } from './contact-dialog-provider'
import { contextQuestion, goalQuestion } from '@/lib/quiz-questions'
import {
  STRENGTH_MIN_SCORE,
  bandFor,
  highlights,
  phaseResults,
  totalScore,
} from '@/lib/quiz-score'
import {
  quizBottlenecksHeading,
  quizContextLine,
  quizCtaBody,
  quizCtaBodyPerfect,
  quizGaugeLabel,
  quizNoStrengthsMessage,
  quizPerfectHeadline,
  quizPerfectSupportText,
  quizPhaseScoreLabel,
  quizRestartLabel,
  quizShareLabel,
  quizTalkLabel,
} from '@/lib/quiz'
import { contactMessageQuestion } from '@/lib/contact'
import { encodeAnswers } from '@/lib/quiz-share'

const perfect = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3]
const bleak = [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function renderResult(answers: number[], onRestart = vi.fn()) {
  render(
    <ContactDialogProvider>
      <QuizResult answers={answers} onRestart={onRestart} />
    </ContactDialogProvider>
  )
  return onRestart
}

describe('QuizResult', () => {
  it('leads with the band as the page heading', () => {
    renderResult(perfect)

    const band = bandFor(totalScore(phaseResults(perfect)))
    expect(
      screen.getByRole('heading', { level: 1, name: band.name })
    ).toBeInTheDocument()
    expect(screen.getByText(band.description)).toBeInTheDocument()
  })

  it('shows the score on the gauge', () => {
    renderResult(perfect)

    expect(
      screen.getByRole('img', { name: quizGaugeLabel(100) })
    ).toBeInTheDocument()
  })

  it('echoes the stage and goal the visitor chose', () => {
    renderResult(bleak)

    expect(
      screen.getByText(
        quizContextLine(contextQuestion.options[1], goalQuestion.options[2])
      )
    ).toBeInTheDocument()
  })

  it('charts all nine phases in the bars', () => {
    renderResult(bleak)

    // getAllByText(phase.name) would also match the <h3> a bottleneck card
    // renders for the same phase, so it can't tell a missing bar row from a
    // present card. Anchoring on the bar row's own role="img" + accessible
    // name (quizPhaseScoreLabel, set by quiz-phase-bars.tsx) can only be
    // satisfied by the bar itself.
    for (const result of phaseResults(bleak)) {
      expect(
        screen.getByRole('img', {
          name: quizPhaseScoreLabel(result.name, result.score),
        })
      ).toBeInTheDocument()
    }
  })

  it('replaces Gargalos with the perfect-score message when every phase maxes out', () => {
    renderResult(perfect)

    expect(highlights(phaseResults(perfect)).bottlenecks).toEqual([])
    expect(screen.getByText(quizPerfectHeadline)).toBeInTheDocument()
    expect(screen.getByText(quizPerfectSupportText)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: quizBottlenecksHeading })
    ).not.toBeInTheDocument()
  })

  it('still shows Gargalos normally when the score is not perfect', () => {
    renderResult(bleak)

    expect(
      screen.getByRole('heading', { name: quizBottlenecksHeading })
    ).toBeInTheDocument()
  })

  it('swaps the CTA body copy for a perfect score', () => {
    renderResult(perfect)

    expect(screen.getByText(quizCtaBodyPerfect)).toBeInTheDocument()
    expect(screen.queryByText(quizCtaBody)).not.toBeInTheDocument()
  })

  it('keeps the default CTA body otherwise', () => {
    renderResult(bleak)

    expect(screen.getByText(quizCtaBody)).toBeInTheDocument()
  })

  it('says plainly when there is no strength to show', () => {
    renderResult(bleak)

    expect(highlights(phaseResults(bleak)).strengths).toEqual([])
    expect(
      screen.getByText(quizNoStrengthsMessage(STRENGTH_MIN_SCORE))
    ).toBeInTheDocument()
  })

  it('opens the contact dialog carrying the result', async () => {
    const user = userEvent.setup()
    renderResult(bleak)

    await user.click(screen.getByRole('button', { name: quizTalkLabel }))

    expect(
      (screen.getByLabelText(contactMessageQuestion) as HTMLTextAreaElement)
        .value
    ).toContain('0/100')
  })

  it('wires the share button to these exact answers', async () => {
    const user = userEvent.setup()
    renderResult(bleak)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(await navigator.clipboard.readText()).toContain(
      `r=${encodeAnswers(bleak)}`
    )
  })

  it('hands the restart back to its caller', async () => {
    const user = userEvent.setup()
    const onRestart = renderResult(bleak)

    await user.click(screen.getByRole('button', { name: quizRestartLabel }))

    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('catches focus on the heading, since the question that had it is gone', () => {
    renderResult(perfect)

    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 1 })
    )
  })
})
