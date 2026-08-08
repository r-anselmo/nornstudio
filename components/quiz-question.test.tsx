import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizQuestion } from './quiz-question'
import { phases } from '@/lib/quiz-questions'
import { quizBackLabel, quizPositionLabel } from '@/lib/quiz'

const phase = phases[0]

function renderQuestion(
  overrides: Partial<Parameters<typeof QuizQuestion>[0]> = {}
) {
  const props = {
    tag: phase.tag,
    question: phase.question,
    options: phase.options,
    selected: null as number | null,
    position: 3,
    total: 11,
    onAnswer: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  }
  render(<QuizQuestion {...props} />)
  return props
}

describe('QuizQuestion', () => {
  it('makes the question the page heading', () => {
    renderQuestion()

    expect(
      screen.getByRole('heading', { level: 1, name: phase.question })
    ).toBeInTheDocument()
  })

  it('offers every option as a button', () => {
    renderQuestion()

    for (const option of phase.options) {
      expect(screen.getByRole('button', { name: option })).toBeInTheDocument()
    }
  })

  it('answers with the option index', async () => {
    const user = userEvent.setup()
    const { onAnswer } = renderQuestion()

    await user.click(screen.getByRole('button', { name: phase.options[2] }))

    expect(onAnswer).toHaveBeenCalledWith(2)
  })

  it('marks the option already chosen, for anyone who came back', () => {
    renderQuestion({ selected: 1 })

    expect(screen.getByRole('button', { name: phase.options[1] })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: phase.options[0] })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('announces the position without putting it on screen twice', () => {
    renderQuestion()

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(quizPositionLabel(3, 11))
    expect(status.className).toContain('sr-only')
  })

  it('takes focus onto the question, since the pressed button is gone', () => {
    renderQuestion()

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('offers a way back', async () => {
    const user = userEvent.setup()
    const { onBack } = renderQuestion()

    await user.click(screen.getByRole('button', { name: quizBackLabel }))

    expect(onBack).toHaveBeenCalledOnce()
  })
})
