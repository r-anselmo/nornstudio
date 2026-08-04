// Copy lives here rather than in JSX: `react/no-unescaped-entities` is
// error-level in this repo and rejects apostrophes and quotes in JSX text.
//
// The hero was the last section still holding its copy inline, which mattered
// once `app/opengraph-image.tsx` started drawing the same words: a share card
// that quietly disagrees with the page is worse than no share card. Both read
// from here, as does the document description in `app/layout.tsx`.

export type HeroLine = {
  text: string
  /** Rendered as a lime block — the payoff half of the statement. */
  emphasis?: boolean
}

export const heroHeadline: HeroLine[] = [
  { text: 'TODO MUNDO' },
  { text: 'FALA EM' },
  { text: 'ESTRATÉGIA.' },
  { text: 'A GENTE', emphasis: true },
  { text: 'EXECUTA.', emphasis: true },
]

export const heroTagline =
  'Do experimento ao resultado: a gente acelera suas iniciativas digitais por dentro.'

export const siteName = 'Norn — Growth Design'

/**
 * Absolute base for metadata URLs. Open Graph consumers do not resolve
 * relative paths, so this cannot be inferred from the request the way the rest
 * of the site's links can — a static export has no request to infer from.
 *
 * Hardcoded to production on purpose: a locally-built page pointing its share
 * card at localhost would be the wrong kind of correct.
 */
export const siteUrl = 'https://r-anselmo.github.io/nornstudio/'
