import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizShareButton } from './quiz-share-button'
import {
  quizShareCopied,
  quizShareLabel,
  quizShareLinkLabel,
  quizShareManual,
} from '@/lib/quiz'
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

  it('puts the confirmation in a live region present from first render', async () => {
    // Testing Library can only confirm the region carries the right text —
    // it cannot verify a screen reader actually announces it. What it does
    // pin down is the shape that makes real announcement reliable: a region
    // inserted already containing its text is not — see
    // components/contact-dialog.tsx's success-state comment.
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent('')

    await user.click(screen.getByRole('button', { name: quizShareLabel }))

    expect(status).toHaveTextContent(quizShareCopied)
  })

  it('leaves focus on the button instead of stealing it for the confirmation', async () => {
    const user = userEvent.setup()
    render(<QuizShareButton answers={answers} />)

    const button = screen.getByRole('button', { name: quizShareLabel })
    await user.click(button)

    expect(document.activeElement).toBe(button)
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
    const link = screen.getByRole('textbox', {
      name: quizShareLinkLabel,
    }) as HTMLInputElement
    expect(link.value).toContain(`r=${encodeAnswers(answers)}`)
  })
})
