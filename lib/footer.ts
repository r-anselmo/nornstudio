// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level and rejects apostrophes and quotes in JSX text.

import { quizNavLabel } from '@/lib/quiz'

export type FooterLink = {
  href: string
  label: string
}

export const footerTagline = 'Estratégia é o começo. Execução é o que entrega.'

export const footerLinks: FooterLink[] = [
  { href: '#servicos', label: 'SERVIÇOS' },
  { href: '#como-fazemos', label: 'COMO FAZEMOS' },
  { href: '/quiz/', label: quizNavLabel },
  { href: '#contato', label: 'CONTATO' },
]

/** Used by the footer and by the manifesto card in WhatWeDo. */
export const brandSignature = 'NORNGROWTHDESIGN · SINCE 2026'
