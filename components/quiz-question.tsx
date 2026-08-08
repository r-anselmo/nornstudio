'use client'

import { useEffect, useRef } from 'react'
import { quizBackLabel, quizPositionLabel } from '@/lib/quiz'

/**
 * Options are buttons rather than a radiogroup. Choosing one advances the
 * screen, and a radiogroup moves its selection with the arrow keys — so every
 * arrow press would advance the quiz. The semantics that look more correct
 * produce the wrong behaviour; `aria-pressed` is honest about what a click
 * does and Tab still walks them.
 */
export function QuizQuestion({
  tag,
  question,
  options,
  selected,
  position,
  total,
  onAnswer,
  onBack,
}: {
  tag: string
  question: string
  options: readonly string[]
  selected: number | null
  position: number
  total: number
  onAnswer: (option: number) => void
  onBack: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The button that was just pressed no longer exists, so focus falls to
    // <body>: the next Tab starts from the top of the document and a screen
    // reader never hears the new question.
    headingRef.current?.focus()
  }, [position])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="font-body text-xs font-medium uppercase tracking-[0.1em] text-lime">
        {tag}
      </p>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-black leading-snug text-alabaster focus:outline-none md:text-4xl"
      >
        {question}
      </h1>

      {/* The visible progress lives in the top bar and is decorative there.
          This is the same information in the form a screen reader can use. */}
      <p role="status" className="sr-only">
        {quizPositionLabel(position, total)}
      </p>

      <ul className="flex flex-col gap-3">
        {options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              aria-pressed={selected === index}
              onClick={() => onAnswer(index)}
              className={`focus-ring flex w-full items-center gap-4 rounded-2xl border p-5 text-left font-body text-sm text-alabaster transition-colors duration-instant motion-reduce:transition-none md:text-base ${
                selected === index
                  ? 'border-lime bg-lime/10'
                  : 'border-alabaster/10 bg-alabaster/5 hover:border-lime/50'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full border ${
                  selected === index
                    ? 'border-lime bg-lime'
                    : 'border-platinum-gray'
                }`}
              />
              {option}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onBack}
        className="focus-ring w-fit rounded-sm font-body text-sm text-platinum-gray transition-colors duration-instant hover:text-alabaster motion-reduce:transition-none"
      >
        {quizBackLabel}
      </button>
    </div>
  )
}
