import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizShareButton } from './quiz-share-button'
import { quizShareCopied, quizShareLabel, quizShareManual } from '@/lib/quiz'
import { encodeAnswers } from '@/lib/quiz-share'

const answers = [3, 4, 0, 1, 2, 3, 0, 1, 2, 3, 0]

// The refusal case replaces `writeText`; without this it stays replaced for
// whatever runs next.
afterEach(() => {
  vi.restoreAllMocks()
})

describe('QuizShareButton', () => {
  it('copies a link that carries the answers', async () => {
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(await navigator.clipboard.readText()).toContain(
      `r=${encodeAnswers(answers)}`
    )
  })

  it('confirms the copy where a screen reader will hear it', async () => {
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(await screen.findByRole('status')).toHaveTextContent(quizShareCopied)
  })

  it('shows the link to copy by hand when the clipboard refuses', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied')
    )
    render(<QuizShareButton answers={answers} />)

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    // Clipboard access needs a secure context and can be refused outright;
    // without this the button would fail silently.
    expect(await screen.findByText(quizShareManual)).toBeInTheDocument()
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toContain(
      `r=${encodeAnswers(answers)}`
    )
  })
})
