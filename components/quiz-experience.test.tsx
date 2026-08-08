import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizExperience } from './quiz-experience'
import { ContactDialogProvider } from './contact-dialog-provider'
import { QUESTION_COUNT, phases, questionAt } from '@/lib/quiz-questions'
import { bandFor, phaseResults, totalScore } from '@/lib/quiz-score'
import { encodeAnswers } from '@/lib/quiz-share'
import {
  quizIntroHeadline,
  quizPositionLabel,
  quizRestartLabel,
  quizStartLabel,
} from '@/lib/quiz'

const perfect = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3]

function renderQuiz() {
  return render(
    <ContactDialogProvider>
      <QuizExperience />
    </ContactDialogProvider>
  )
}

/** Answers every question with the strongest option it offers. */
async function answerEverything(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: quizStartLabel }))
  for (let index = 0; index < QUESTION_COUNT; index++) {
    const options = questionAt(index).options
    await user.click(
      screen.getByRole('button', { name: options[options.length - 1] })
    )
  }
}

beforeEach(() => {
  window.history.replaceState({}, '', '/quiz/')
})

describe('QuizExperience', () => {
  it('opens on the intro', () => {
    renderQuiz()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('walks every question and lands on the result', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerEverything(user)

    const band = bandFor(
      totalScore(phaseResults([0, 0, ...Array<number>(phases.length).fill(3)]))
    )
    expect(
      screen.getByRole('heading', { level: 1, name: band.name })
    ).toBeInTheDocument()
  })

  it('keeps the answer when the visitor goes back', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    const first = questionAt(0).options
    await user.click(screen.getByRole('button', { name: first[1] }))
    await user.click(screen.getByRole('button', { name: /voltar/ }))

    expect(screen.getByRole('button', { name: first[1] })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('goes back to the intro from the first question', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    await user.click(screen.getByRole('button', { name: /voltar/ }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('opens straight on the result for a shared link', () => {
    window.history.replaceState({}, '', `/quiz/?r=${encodeAnswers(perfect)}`)
    renderQuiz()

    expect(
      screen.getByRole('heading', { level: 1, name: bandFor(100).name })
    ).toBeInTheDocument()
  })

  it('falls back to the intro when the link is junk', () => {
    window.history.replaceState({}, '', '/quiz/?r=nonsense')
    renderQuiz()

    // A tampered link is not worth an interstitial; it just starts the quiz.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('clears the shared link when the visitor starts over', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', `/quiz/?r=${encodeAnswers(perfect)}`)
    renderQuiz()

    await user.click(screen.getByRole('button', { name: quizRestartLabel }))

    // Otherwise the next refresh throws them back onto someone else's result.
    expect(window.location.search).toBe('')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('tracks progress while questions are on screen', async () => {
    const user = userEvent.setup()
    renderQuiz()

    expect(screen.queryByRole('progressbar')).toBeNull()

    await user.click(screen.getByRole('button', { name: quizStartLabel }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    const first = questionAt(0).options
    await user.click(screen.getByRole('button', { name: first[0] }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '9')
  })

  it('keeps a permanent status region for the question position, empty until a question shows', async () => {
    const user = userEvent.setup()
    renderQuiz()

    // Mounted from first paint, unlike the question screen's own heading: on
    // the very first question there is no QuizQuestion instance yet to own
    // this text, so a region created there would already contain "Pergunta 1
    // de 11" at the moment it is inserted — not reliably announced.
    const status = screen.getByRole('status')
    expect(status.className).toContain('sr-only')
    expect(status).toHaveTextContent('')

    await user.click(screen.getByRole('button', { name: quizStartLabel }))

    expect(status).toHaveTextContent(quizPositionLabel(1, QUESTION_COUNT))
  })
})
