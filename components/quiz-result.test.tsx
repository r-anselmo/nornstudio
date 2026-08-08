import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizResult } from './quiz-result'
import { ContactDialogProvider } from './contact-dialog-provider'
import { contextQuestion, goalQuestion, phases } from '@/lib/quiz-questions'
import { bandFor, highlights, phaseResults, totalScore } from '@/lib/quiz-score'
import {
  quizContextLine,
  quizGaugeLabel,
  quizNoBottlenecksMessage,
  quizNoStrengthsMessage,
  quizRestartLabel,
  quizTalkLabel,
} from '@/lib/quiz'
import { contactMessageQuestion } from '@/lib/contact'

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

  it('charts all nine phases', () => {
    renderResult(bleak)

    for (const phase of phases) {
      expect(screen.getAllByText(phase.name).length).toBeGreaterThan(0)
    }
  })

  it('says plainly when there is no bottleneck to show', () => {
    renderResult(perfect)

    expect(highlights(phaseResults(perfect)).bottlenecks).toEqual([])
    expect(screen.getByText(quizNoBottlenecksMessage)).toBeInTheDocument()
  })

  it('says plainly when there is no strength to show', () => {
    renderResult(bleak)

    expect(highlights(phaseResults(bleak)).strengths).toEqual([])
    expect(screen.getByText(quizNoStrengthsMessage)).toBeInTheDocument()
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
