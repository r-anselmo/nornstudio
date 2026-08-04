export type ContactValues = {
  name: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>

export const MESSAGE_MIN_LENGTH = 10

/**
 * Deliberately loose: something@something.something. Anything stricter starts
 * rejecting valid addresses, and the real test of an address is whether the
 * reply lands in it.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Returns every problem at once, keyed by field. Revealing errors one at a
 * time makes a three-field form feel like an interrogation.
 */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}

  if (values.name.trim() === '') {
    errors.name = 'Diz seu nome pra gente.'
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Confere o e-mail: sem ele a gente não consegue responder.'
  }

  if (values.message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = 'Conta um pouco mais — pelo menos uma frase.'
  }

  return errors
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0
}
