'use client'

import { useState } from 'react'
import {
  quizShareCopied,
  quizShareLabel,
  quizShareManual,
} from '@/lib/quiz'
import { buildShareUrl } from '@/lib/quiz-share'

export function QuizShareButton({ answers }: { answers: readonly number[] }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [link, setLink] = useState('')

  async function copy() {
    const url = buildShareUrl(answers)
    setLink(url)

    try {
      await navigator.clipboard.writeText(url)
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

      {status === 'copied' && (
        <p role="status" className="font-body text-xs text-lime">
          {quizShareCopied}
        </p>
      )}

      {status === 'manual' && (
        <div role="status" className="flex flex-col gap-1">
          <span className="font-body text-xs text-platinum-gray">
            {quizShareManual}
          </span>
          <input
            readOnly
            value={link}
            aria-label={quizShareLabel}
            onFocus={(event) => event.currentTarget.select()}
            className="focus-ring w-full rounded-lg border border-alabaster/15 bg-alabaster/5 px-3 py-2 font-body text-xs text-alabaster"
          />
        </div>
      )}
    </div>
  )
}
