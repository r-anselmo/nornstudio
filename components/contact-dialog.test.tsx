import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactDialogProvider } from './contact-dialog-provider'
import { ContactTrigger } from './contact-trigger'
import {
  contactEmailQuestion,
  contactErrorMessage,
  contactMessageQuestion,
  contactNameQuestion,
  contactSubmitLabel,
  contactSuccessTitle,
} from '@/lib/contact'
import { MOTION_HYDRATED_FLAG } from '@/lib/motion'

const { submitMock } = vi.hoisted(() => ({
  submitMock: vi.fn(() => Promise.resolve({ ok: true })),
}))

vi.mock('@/lib/contact-submit', () => ({
  submitContact: submitMock,
}))

afterEach(() => {
  submitMock.mockClear()
  submitMock.mockResolvedValue({ ok: true })
})

function renderDialog() {
  return render(
    <ContactDialogProvider>
      <ContactTrigger>Iniciar Projeto</ContactTrigger>
    </ContactDialogProvider>
  )
}

async function openAndFill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
  await user.type(screen.getByLabelText(contactNameQuestion), 'Rodrigo')
  await user.type(
    screen.getByLabelText(contactEmailQuestion),
    'rodrigo@deployux.com'
  )
  await user.type(
    screen.getByLabelText(contactMessageQuestion),
    'A conversão do onboarding caiu 30%.'
  )
}

describe('ContactDialogProvider', () => {
  it('reports hydration to the motion gate', () => {
    expect(
      (window as unknown as Record<string, boolean>)[MOTION_HYDRATED_FLAG]
    ).toBeUndefined()

    renderDialog()

    // The gate script withdraws the motion class unless this lands, so losing
    // it would silently un-hide every reveal on the site eight seconds in.
    expect(
      (window as unknown as Record<string, boolean>)[MOTION_HYDRATED_FLAG]
    ).toBe(true)
  })
})

describe('ContactDialog', () => {
  it('stays closed until the trigger is used', () => {
    renderDialog()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from the trigger', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('labels every field, so the questions are real labels', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(screen.getByLabelText(contactNameQuestion)).toBeInTheDocument()
    expect(screen.getByLabelText(contactEmailQuestion)).toBeInTheDocument()
    expect(screen.getByLabelText(contactMessageQuestion)).toBeInTheDocument()
  })

  it('refuses to submit an incomplete form', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(submitMock).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Diz seu nome pra gente.')
    ).toBeInTheDocument()
  })

  it('marks invalid fields and links them to their message', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    const nameField = await screen.findByLabelText(contactNameQuestion)
    expect(nameField).toHaveAttribute('aria-invalid', 'true')

    // The message has to be reachable from the field, or a screen reader
    // announces the field as invalid without saying why.
    const describedBy = nameField.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      'Diz seu nome pra gente.'
    )
  })

  it('moves focus to the first invalid field on a failed submit', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(await screen.findByLabelText(contactNameQuestion)).toHaveFocus()
  })

  it('clears the invalid marking once the field is corrected', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))
    await user.type(screen.getByLabelText(contactNameQuestion), 'Rodrigo')
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(screen.getByLabelText(contactNameQuestion)).toHaveAttribute(
      'aria-invalid',
      'false'
    )
  })

  it('submits a complete form and confirms it', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(await screen.findByText(contactSuccessTitle)).toBeInTheDocument()
    expect(submitMock).toHaveBeenCalledWith({
      name: 'Rodrigo',
      email: 'rodrigo@deployux.com',
      message: 'A conversão do onboarding caiu 30%.',
      botcheck: '',
    })
  })

  it('keeps what was typed when sending fails', async () => {
    submitMock.mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    expect(await screen.findByText(contactErrorMessage)).toBeInTheDocument()
    // Losing three fields of typing to a flaky network is the worst possible
    // moment to make someone start over.
    expect(screen.getByLabelText(contactNameQuestion)).toHaveValue('Rodrigo')
    expect(screen.getByLabelText(contactMessageQuestion)).toHaveValue(
      'A conversão do onboarding caiu 30%.'
    )
  })

  it('hides the honeypot from people but leaves it in the form', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    const honeypot = document.querySelector('input[name="botcheck"]')
    expect(honeypot).toBeInTheDocument()
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces the confirmation to assistive technology', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    // The submit button that held focus is removed on success, so without a
    // live region nothing tells a screen reader the message actually sent.
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent(contactSuccessTitle)
  })

  it('catches focus when the confirmation replaces the form', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))

    // The submit button that held focus is unmounted. Without catching it,
    // Tab escapes to the page behind the still-open dialog.
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus())
  })

  it('starts clean the next time it opens', async () => {
    const user = userEvent.setup()
    renderDialog()

    await openAndFill(user)
    await user.click(screen.getByRole('button', { name: contactSubmitLabel }))
    await screen.findByText(contactSuccessTitle)

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar Projeto' }))

    expect(await screen.findByLabelText(contactNameQuestion)).toHaveValue('')
  })
})
