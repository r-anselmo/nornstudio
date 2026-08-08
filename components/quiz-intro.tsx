import { ArrowRight } from 'lucide-react'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'
import {
  quizFinePrint,
  quizIntroBullets,
  quizIntroClosing,
  quizIntroEyebrow,
  quizIntroHeadline,
  quizIntroHeadlineEmphasis,
  quizIntroHow,
  quizIntroLede,
  quizIntroPromise,
  quizStartLabel,
} from '@/lib/quiz'

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SectionEyebrow>{quizIntroEyebrow}</SectionEyebrow>

      <h1 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-5xl">
        {quizIntroHeadline}{' '}
        <span className="text-lime">{quizIntroHeadlineEmphasis}</span>
      </h1>

      <p className="font-body text-base text-platinum-gray">{quizIntroLede}</p>
      <p className="font-body text-base text-platinum-gray">{quizIntroHow}</p>
      <p className="font-body text-base text-platinum-gray">{quizIntroPromise}</p>

      <ul className="flex flex-col gap-3">
        {quizIntroBullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-3 font-body text-sm text-platinum-gray"
          >
            <span aria-hidden="true" className="shrink-0 text-lime">
              →
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <p className="font-body text-base text-alabaster">{quizIntroClosing}</p>

      <button
        type="button"
        onClick={onStart}
        className="focus-ring group flex w-fit items-center gap-3 rounded-full bg-lime px-8 py-4 font-heading text-lg font-black text-carbon-black transition-colors duration-instant hover:bg-lime/90 motion-reduce:transition-none"
      >
        {quizStartLabel}
        <ArrowRight
          className="h-5 w-5 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>

      <p className="font-body text-xs text-platinum-gray">{quizFinePrint}</p>
    </div>
  )
}
