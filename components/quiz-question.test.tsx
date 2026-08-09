import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizQuestion } from './quiz-question'
import { phases } from '@/lib/quiz-questions'
import { quizBackLabel } from '@/lib/quiz'

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
    onAnswer: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  }
  const { rerender } = render(<QuizQuestion {...props} />)
  return { ...props, rerender }
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

  it('hides the option marker dot from the accessible name', () => {
    renderQuestion()

    const button = screen.getByRole('button', { name: phase.options[0] })
    const marker = button.querySelector('span[aria-hidden]')
    expect(marker).toHaveAttribute('aria-hidden', 'true')
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

  it('takes focus onto the question, since the pressed button is gone', () => {
    renderQuestion()

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('refocuses the new heading when a click removes the button that had focus', async () => {
    const user = userEvent.setup()
    const { rerender } = renderQuestion()

    // Clicking an option gives it native focus, same as a real answer click.
    await user.click(screen.getByRole('button', { name: phase.options[0] }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: phase.options[0] })
    )

    // The parent swaps in the next question: different options, so React
    // unmounts the previously-focused button along with the rest of the list.
    const nextPhase = phases[1]
    rerender(
      <QuizQuestion
        tag={nextPhase.tag}
        question={nextPhase.question}
        options={nextPhase.options}
        selected={null}
        position={4}
        onAnswer={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 1, name: nextPhase.question })
    )
  })

  it('offers a way back', async () => {
    const user = userEvent.setup()
    const { onBack } = renderQuestion()

    await user.click(screen.getByRole('button', { name: quizBackLabel }))

    expect(onBack).toHaveBeenCalledOnce()
  })
})
