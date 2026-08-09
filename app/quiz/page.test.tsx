import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuizPage, { metadata } from './page'
import { ContactDialogProvider } from '@/components/contact-dialog-provider'
import { quizIntroHeadline, quizPageDescription, quizPageTitle } from '@/lib/quiz'
import { siteName, siteUrl } from '@/lib/hero'

describe('QuizPage', () => {
  it('renders the quiz on its intro screen', () => {
    render(
      <ContactDialogProvider>
        <QuizPage />
      </ContactDialogProvider>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      quizIntroHeadline
    )
  })

  it('titles and describes itself for search and for shares', () => {
    expect(metadata.title).toBe(`${quizPageTitle} — ${siteName}`)
    expect(metadata.description).toBe(quizPageDescription)
    expect(metadata.openGraph?.url).toBe(`${siteUrl}quiz/`)
  })
})
