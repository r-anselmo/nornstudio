'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { ContactDialog } from '@/components/contact-dialog'
import { MOTION_HYDRATED_FLAG } from '@/lib/motion'

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
 *
 * That position — the outermost client component on every page — is also why it
 * carries the hydration flag the motion gate waits on.
 */
export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const value = useMemo(() => ({ open }), [open])

  useEffect(() => {
    // Tells the gate script in app/layout.tsx that the bundle is alive, so it
    // does not withdraw the motion gate and force everything visible.
    ;(window as unknown as Record<string, boolean>)[MOTION_HYDRATED_FLAG] = true
  }, [])

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      <ContactDialog open={isOpen} onOpenChange={setIsOpen} />
    </ContactDialogContext.Provider>
  )
}
