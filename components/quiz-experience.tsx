'use client'

import { useEffect, useReducer } from 'react'
import { QuizIntro } from '@/components/quiz-intro'
import { QuizQuestion } from '@/components/quiz-question'
import { QuizResult } from '@/components/quiz-result'
import { NornBadge } from '@/components/ui/norn-badge'
import { brandSignature } from '@/lib/footer'
import { quizChromeLabel, quizPositionLabel, quizProgressLabel } from '@/lib/quiz'
import { QUESTION_COUNT, questionAt } from '@/lib/quiz-questions'
import { isComplete } from '@/lib/quiz-score'
import { readSharedAnswers } from '@/lib/quiz-share'

type Screen = 'intro' | 'question' | 'result'

type State = {
  screen: Screen
  index: number
  answers: (number | null)[]
}

type Action =
  | { type: 'start' }
  | { type: 'answer'; option: number }
  | { type: 'back' }
  | { type: 'restart' }
  | { type: 'restore'; answers: number[] }

const initialState: State = {
  screen: 'intro',
  index: 0,
  answers: Array(QUESTION_COUNT).fill(null),
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, screen: 'question', index: 0 }

    case 'answer': {
      const answers = [...state.answers]
      answers[state.index] = action.option
      const wasLast = state.index === QUESTION_COUNT - 1

      return {
        screen: wasLast ? 'result' : 'question',
        index: wasLast ? state.index : state.index + 1,
        answers,
      }
    }

    case 'back':
      // From the first question, back means the intro — and the answers
      // survive it. Re-reading the premise should not cost the visitor their
      // place.
      return state.index === 0
        ? { ...state, screen: 'intro' }
        : { ...state, index: state.index - 1 }

    case 'restart':
      return { ...initialState, answers: Array(QUESTION_COUNT).fill(null) }

    case 'restore':
      // Trusts `action.answers` to already be exactly QUESTION_COUNT long and
      // each value inside its own question's option range. `decodeAnswers`
      // (lib/quiz-share.ts) guarantees that before the only call site below —
      // `isComplete`, the render guard downstream, checks length and
      // non-null, not range. A future call site that skipped that validation
      // would not crash; it would render the header and footer with a blank
      // `<main>`, `isComplete` silently rejecting the malformed answers.
      return {
        screen: 'result',
        index: QUESTION_COUNT - 1,
        answers: action.answers,
      }
  }
}

export function QuizExperience() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    // In an effect rather than during render: the export is prerendered with
    // no query string, so reading `location` while rendering would be a
    // hydration mismatch.
    //
    // `useLayoutEffect` would remove the one-paint flash of the intro before
    // a shared-link result swaps in, without reopening that mismatch — but it
    // fires during the server render `next build` performs for the static
    // export, where there is no layout to synchronize with, and React warns
    // on every prerender that uses it. That warning would be permanent,
    // repeating on every build, to erase a flash of roughly two frames that
    // nobody perceives. Kept as `useEffect`.
    const shared = readSharedAnswers(window.location.search)
    if (shared) dispatch({ type: 'restore', answers: shared })
  }, [])

  function restart() {
    dispatch({ type: 'restart' })
    // A visitor who arrived on a shared link and chose to start over would be
    // thrown back onto someone else's result by the next refresh.
    window.history.replaceState(null, '', window.location.pathname)
  }

  const answered = state.answers.filter((answer) => answer !== null).length
  const progress = Math.round((answered / QUESTION_COUNT) * 100)

  const question = state.screen === 'question' ? questionAt(state.index) : null

  return (
    <div className="flex min-h-svh flex-col bg-carbon-black">
      <header className="border-b border-alabaster/10 px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <NornBadge />
          <span className="font-body text-xs font-medium tracking-[0.1em] text-platinum-gray">
            {quizChromeLabel}
          </span>
          {state.screen === 'question' && (
            <div
              role="progressbar"
              aria-label={quizProgressLabel}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="ml-auto h-1 w-20 overflow-hidden rounded-full bg-alabaster/10 md:w-56"
            >
              <span
                style={{ width: `${progress}%` }}
                className="block h-full rounded-full bg-lime transition-[width] duration-base ease-out-quad motion-reduce:transition-none"
              />
            </div>
          )}
        </div>

        {/* Permanently mounted, rather than owned by QuizQuestion: on the
            very first question there is no QuizQuestion instance yet to
            insert this text, so a live region created there would already
            contain "Pergunta 1 de 11" the moment it appears — a screen
            reader does not reliably announce a live region that arrives with
            content already inside it. Sitting here instead means only its
            text content ever changes, so every announcement fires, including
            the first. It is this bar's accessible twin: same information,
            silent and empty outside a question. */}
        <p role="status" className="sr-only">
          {state.screen === 'question'
            ? quizPositionLabel(state.index + 1, QUESTION_COUNT)
            : ''}
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:px-12 md:py-20">
        {state.screen === 'intro' && (
          <QuizIntro onStart={() => dispatch({ type: 'start' })} />
        )}

        {question && (
          <QuizQuestion
            tag={question.tag}
            question={question.question}
            options={question.options}
            selected={state.answers[state.index]}
            position={state.index + 1}
            onAnswer={(option) => dispatch({ type: 'answer', option })}
            onBack={() => dispatch({ type: 'back' })}
          />
        )}

        {state.screen === 'result' && isComplete(state.answers) && (
          <QuizResult answers={state.answers} onRestart={restart} />
        )}
      </main>

      <footer className="border-t border-alabaster/10 px-6 py-8 md:px-12">
        <p className="mx-auto max-w-3xl font-body text-xs tracking-[0.02em] text-platinum-gray">
          {brandSignature}
        </p>
      </footer>
    </div>
  )
}
