'use client'

import type { ReactNode } from 'react'
import { useContactDialog } from '@/components/contact-dialog-provider'

/**
 * A button, not a link: it opens a dialog rather than navigating anywhere.
 * Styling comes from the caller so the hero's outlined pill and the CTA
 * section's solid block can share one behaviour.
 */
export function ContactTrigger({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const { open } = useContactDialog()

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
