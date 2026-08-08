import type { Metadata } from 'next'
import { QuizExperience } from '@/components/quiz-experience'
import { siteName, siteUrl } from '@/lib/hero'
import { quizPageDescription, quizPageTitle } from '@/lib/quiz'

export const metadata: Metadata = {
  title: `${quizPageTitle} — ${siteName}`,
  description: quizPageDescription,
  openGraph: {
    title: `${quizPageTitle} — ${siteName}`,
    description: quizPageDescription,
    siteName,
    locale: 'pt_BR',
    type: 'website',
    url: `${siteUrl}quiz/`,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${quizPageTitle} — ${siteName}`,
    description: quizPageDescription,
  },
}

// The experience owns the whole frame — top bar, main and signature — because
// the progress track in the bar is quiz state. There is nothing left for the
// route to wrap it in.
export default function QuizPage() {
  return <QuizExperience />
}
