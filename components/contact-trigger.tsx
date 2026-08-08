'use client'

import type { ReactNode } from 'react'
import { useContactDialog } from '@/components/contact-dialog-provider'

/**
 * A button, not a link: it opens a dialog rather than navigating anywhere.
 * Styling comes from the caller so the hero's outlined pill and the CTA
 * section's solid block can share one behaviour.
 *
 * `message` seeds the form. The quiz passes its result; every other caller
 * passes nothing and gets an empty form, as before.
 */
export function ContactTrigger({
  children,
  className = '',
  message,
}: {
  children: ReactNode
  className?: string
  message?: string
}) {
  const { open } = useContactDialog()

  return (
    <button type="button" onClick={() => open({ message })} className={className}>
      {children}
    </button>
  )
}
