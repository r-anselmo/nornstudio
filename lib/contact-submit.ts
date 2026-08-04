import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '@/lib/contact'
import type { ContactValues } from '@/lib/validate-contact'

export type ContactSubmission = ContactValues & {
  /**
   * Value of the hidden honeypot input. Web3Forms drops the submission when it
   * arrives non-empty — a human never sees the field, so only a bot fills it.
   */
  botcheck: string
}

export type ContactResult = { ok: boolean }

/**
 * The only module that knows about Web3Forms.
 *
 * Returns a result rather than throwing: a network rejection and a non-OK
 * response leave the visitor in exactly the same position, so the caller gets
 * one branch to render instead of two.
 */
export async function submitContact(
  submission: ContactSubmission
): Promise<ContactResult> {
  const name = submission.name.trim()
  const email = submission.email.trim()

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Novo projeto — ${name}`,
        from_name: 'Norn Studio',
        name,
        email,
        message: submission.message.trim(),
        // Makes Reply in Gmail address the lead rather than Web3Forms.
        replyto: email,
        botcheck: submission.botcheck,
      }),
    })

    return { ok: response.ok }
  } catch {
    return { ok: false }
  }
}
