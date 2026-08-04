// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.

/**
 * Public by design. Web3Forms access keys are client-side keys, and this is a
 * static export — there is nowhere to hide one, since NEXT_PUBLIC_* values are
 * inlined into the bundle at build time anyway.
 *
 * The exposure is inbox spam, not account compromise. The honeypot in
 * `contact-submit.ts` and Web3Forms' own filtering are the mitigation; the key
 * can be rotated from their dashboard if it is ever abused.
 */
export const WEB3FORMS_ACCESS_KEY = '4d062bc0-bcbe-4889-87f7-a3bc1cb2b2b1'

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

// The button label is NOT re-declared here. `ctaLabel` in `lib/cta.ts` already
// holds 'Iniciar Projeto' and both triggers import it from there — a second
// copy would be needless duplication.

export const contactTitle = 'Vamos começar.'

export const contactDescription =
  'Conta o contexto em duas linhas. A gente responde em até 1 dia útil.'

// Echoes the chat script's opening question on purpose: the dialog is the same
// conversation, continued.
export const contactNameQuestion = 'Como você se chama?'
export const contactEmailQuestion = 'Para qual e-mail a gente responde?'
export const contactMessageQuestion = 'Qual problema te tira o sono hoje?'

export const contactSubmitLabel = 'Enviar'
export const contactSubmittingLabel = 'Enviando'
export const contactCloseLabel = 'Fechar'

export const contactSuccessTitle = 'Recebido.'
export const contactSuccessBody =
  'Sua mensagem chegou. A gente responde em até 1 dia útil.'

export const contactErrorMessage =
  'Não conseguimos enviar agora. Tenta de novo em instantes.'
