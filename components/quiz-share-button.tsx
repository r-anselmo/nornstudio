'use client'

import { useState } from 'react'
import {
  quizShareCopied,
  quizShareLabel,
  quizShareLinkLabel,
  quizShareManual,
} from '@/lib/quiz'
import { buildShareUrl } from '@/lib/quiz-share'

export function QuizShareButton({ answers }: { answers: readonly number[] }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildShareUrl(answers))
      setStatus('copied')
    } catch {
      // The Clipboard API needs a secure context and can be refused outright.
      // Showing the link is the fallback that always works.
      setStatus('manual')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={copy}
        className="focus-ring w-fit rounded-full border border-alabaster/15 px-6 py-3.5 font-body text-sm font-medium text-alabaster transition-colors duration-instant hover:border-platinum-gray motion-reduce:transition-none"
      >
        {quizShareLabel}
      </button>

      {/* Mounted from the first render, empty until `status` changes, so a
          screen reader is already watching this node when the text lands —
          a region inserted already containing its text is not reliably
          announced (see components/contact-dialog.tsx's success state).
          Focus stays on the button above: it is never unmounted here, so
          there is no dropped focus to catch, and stealing it from a button
          the visitor is still holding would be wrong. */}
      <p
        role="status"
        className={`font-body text-xs ${status === 'copied' ? 'text-lime' : 'text-platinum-gray'}`}
      >
        {status === 'copied'
          ? quizShareCopied
          : status === 'manual'
            ? quizShareManual
            : ''}
      </p>

      {status === 'manual' && (
        <input
          readOnly
          value={buildShareUrl(answers)}
          aria-label={quizShareLinkLabel}
          onFocus={(event) => event.currentTarget.select()}
          className="focus-ring w-full rounded-lg border border-alabaster/15 bg-alabaster/5 px-3 py-2 font-body text-xs text-alabaster"
        />
      )}
    </div>
  )
}
