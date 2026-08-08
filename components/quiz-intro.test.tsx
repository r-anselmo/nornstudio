import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizIntro } from './quiz-intro'
import {
  quizFinePrint,
  quizIntroBullets,
  quizIntroHeadline,
  quizIntroHeadlineEmphasis,
  quizStartLabel,
} from '@/lib/quiz'

describe('QuizIntro', () => {
  it('asks the question the page is named after', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(quizIntroHeadline)
    expect(heading).toHaveTextContent(quizIntroHeadlineEmphasis)
  })

  it('lists what the visitor gets at the end', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    for (const bullet of quizIntroBullets) {
      expect(screen.getByText(bullet)).toBeInTheDocument()
    }
  })

  it('keeps the no-signup promise in view', () => {
    render(<QuizIntro onStart={vi.fn()} />)

    expect(screen.getByText(quizFinePrint)).toBeInTheDocument()
  })

  it('starts the quiz from the button', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<QuizIntro onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: quizStartLabel }))

    expect(onStart).toHaveBeenCalledOnce()
  })
})
