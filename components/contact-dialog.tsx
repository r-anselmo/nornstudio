'use client'

import { useId, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowRight, Loader2, X } from 'lucide-react'
import {
  contactCloseLabel,
  contactDescription,
  contactEmailQuestion,
  contactErrorMessage,
  contactMessageQuestion,
  contactNameQuestion,
  contactSubmitLabel,
  contactSubmittingLabel,
  contactSuccessBody,
  contactSuccessTitle,
  contactTitle,
} from '@/lib/contact'
import { submitContact } from '@/lib/contact-submit'
import { isValid, validateContact } from '@/lib/validate-contact'
import type { ContactErrors, ContactValues } from '@/lib/validate-contact'
import { NornBadge } from '@/components/ui/norn-badge'
import { NornMark } from '@/components/ui/norn-mark'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY: ContactValues = { name: '', email: '', message: '' }

const fieldClass =
  'contact-field w-full rounded-2xl border border-alabaster/15 bg-alabaster/5 px-4 py-3 font-body text-sm text-alabaster placeholder:text-platinum-gray/50 transition-colors duration-instant focus-ring focus:border-lime/60 motion-reduce:transition-none'

/**
 * The shell: chrome only, no state. Everything the visitor types lives in
 * `ContactDialogBody`, which sits inside the portal — see the note there.
 */
export function ContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-carbon-black/80 backdrop-blur-sm transition-opacity duration-fast data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[90svh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-3xl border border-alabaster/10 bg-carbon-black p-6 transition-[opacity,transform,scale] duration-base ease-out-expo data-[ending-style]:opacity-0 data-[ending-style]:duration-fast data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] md:p-8 motion-reduce:transition-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <NornBadge className="rounded-xl" />
              <Dialog.Title className="font-heading text-2xl font-black text-alabaster">
                {contactTitle}
              </Dialog.Title>
            </div>
            <Dialog.Close
              aria-label={contactCloseLabel}
              className="focus-ring rounded-lg p-1 text-platinum-gray transition-colors duration-instant hover:text-alabaster motion-reduce:transition-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <ContactDialogBody />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * Owns everything the visitor types.
 *
 * Living inside `Dialog.Portal` is what resets the form: Base UI unmounts the
 * portal subtree once the closing transition has finished, so this component
 * is destroyed and the next opening builds it from scratch. That is both later
 * than a reset on close — the exit transition still plays against the content
 * the visitor was looking at, instead of the form blanking mid-fade — and
 * safer than a timer, which a visitor who reopens the dialog quickly would
 * cancel and land back on a stale form.
 */
function ContactDialogBody() {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()

  const [values, setValues] = useState<ContactValues>(EMPTY)
  const [botcheck, setBotcheck] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (!isValid(nextErrors)) return

    setStatus('submitting')
    const result = await submitContact({ ...values, botcheck })
    setStatus(result.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div
        // The submit button that held focus is gone, and without a live
        // region nothing tells a screen reader the message actually sent.
        role="status"
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <NornMark className="w-12 animate-in fade-in zoom-in-95 text-lime duration-slow ease-spring" />
        <p className="font-heading text-xl font-black text-alabaster">
          {contactSuccessTitle}
        </p>
        <p className="max-w-xs font-body text-sm text-platinum-gray">
          {contactSuccessBody}
        </p>
      </div>
    )
  }

  return (
    <>
      <Dialog.Description className="font-body text-sm text-platinum-gray">
        {contactDescription}
      </Dialog.Description>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* The honeypot. Off-screen rather than display:none, because
            some bots skip fields that are not rendered at all. */}
        <input
          type="text"
          name="botcheck"
          value={botcheck}
          onChange={(event) => setBotcheck(event.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <Field
          id={nameId}
          label={contactNameQuestion}
          error={errors.name}
          delayMs={0}
        >
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field
          id={emailId}
          label={contactEmailQuestion}
          error={errors.email}
          delayMs={90}
        >
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field
          id={messageId}
          label={contactMessageQuestion}
          error={errors.message}
          delayMs={180}
        >
          <textarea
            id={messageId}
            name="message"
            rows={4}
            value={values.message}
            onChange={(event) => update('message', event.target.value)}
            className={`${fieldClass} resize-none`}
          />
        </Field>

        {status === 'error' && (
          <p
            role="alert"
            className="font-body text-sm text-lime animate-in fade-in duration-fast"
          >
            {contactErrorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="focus-ring group mt-1 flex items-center justify-center gap-3 rounded-2xl bg-lime px-8 py-4 font-heading text-lg font-black text-carbon-black transition-[opacity,background-color] duration-instant hover:bg-lime/90 disabled:opacity-70 motion-reduce:transition-none"
        >
          {status === 'submitting' ? (
            <>
              {contactSubmittingLabel}
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            </>
          ) : (
            <>
              {contactSubmitLabel}
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>
    </>
  )
}

// Module scope, not nested inside ContactDialog: react-hooks/static-components
// is error-level in this repo.
function Field({
  id,
  label,
  error,
  delayMs,
  children,
}: {
  id: string
  label: string
  error?: string
  delayMs: number
  children: ReactNode
}) {
  return (
    <div
      className="contact-field flex flex-col gap-2"
      style={{ '--field-delay': `${delayMs}ms` } as CSSProperties}
    >
      {/* The question is the label. It reads as a chat line and still wires up
          to the input, so the conversational framing costs no accessibility. */}
      <label
        htmlFor={id}
        className="w-fit rounded-2xl rounded-bl-sm bg-alabaster/10 px-4 py-2.5 font-body text-sm text-alabaster"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-lime animate-in fade-in duration-fast">
          {error}
        </p>
      )}
    </div>
  )
}
