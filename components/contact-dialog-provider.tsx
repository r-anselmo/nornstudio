'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ContactDialog } from '@/components/contact-dialog'

type ContactDialogValue = {
  open: () => void
}

const ContactDialogContext = createContext<ContactDialogValue | null>(null)

export function useContactDialog(): ContactDialogValue {
  const value = useContext(ContactDialogContext)
  if (!value) {
    throw new Error(
      'ContactTrigger must be rendered inside ContactDialogProvider'
    )
  }
  return value
}

/**
 * Holds the open state and mounts exactly one dialog, no matter how many
 * triggers the page has. Two triggers with two dialogs would duplicate the
 * whole form in the DOM and leave two independent copies of its state.
 *
 * Wraps `{children}` in the layout, which keeps the page tree server-rendered:
 * a client provider can have server children.
 */
export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const value = useMemo(() => ({ open }), [open])

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      <ContactDialog open={isOpen} onOpenChange={setIsOpen} />
    </ContactDialogContext.Provider>
  )
}
