// Renders the Open Graph card to public/opengraph-image.png.
//
// This is a build script rather than app/opengraph-image.tsx, and the reason is
// specific: Next's metadata file convention serves that route extensionless, at
// /opengraph-image. GitHub Pages types files by extension, so it serves that as
// application/octet-stream, and Facebook, LinkedIn and WhatsApp all reject an
// og:image whose Content-Type is not an image. The card renders perfectly and
// no scraper will touch it. Explicit openGraph.images does not help — the file
// convention wins over it, so the route has to not exist at all.
//
// Under public/ the file keeps its .png, is served as image/png, and the URL is
// declared normally in app/layout.tsx.
//
// createElement rather than JSX because Node runs this directly: it strips
// TypeScript types natively, which is how the lib/hero.ts import below works,
// but it does not transform JSX.
//
// The import is 'next/og.js', with the extension. Next ships no exports map, so
// the bare specifier resolves to an extensionless path Node's ESM loader will
// not guess at.

import { createElement as h } from 'react'
import { ImageResponse } from 'next/og.js'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { heroHeadline, heroTagline } from '../lib/hero.ts'

const root = process.cwd()

/**
 * Satori rasterises with the fonts it is handed and nothing else — there is no
 * document to inherit from. Cabinet Grotesk ships as OTF, which it parses;
 * General Sans is WOFF2 only, which it cannot, so the tagline is set in the
 * heading face rather than in something that would silently become a system
 * font.
 */
const cabinetGrotesk = readFileSync(
  join(root, 'app/fonts/cabinet-grotesk/CabinetGrotesk-Black.otf')
)

const mark = readFileSync(join(root, 'app/icon.svg'), 'utf8')
const markDataUri = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`

const LIME = '#C6F432'
const CARBON = '#1D1E18'
const ALABASTER = '#FAFBFA'
const PLATINUM = '#C7C7C5'

export const SIZE = { width: 1200, height: 630 }
export const OUTPUT = 'public/opengraph-image.png'

function headlineLine({ text, emphasis }) {
  return h(
    'div',
    {
      key: text,
      style: {
        display: 'flex',
        fontSize: 54,
        lineHeight: 1,
        letterSpacing: 1,
        // The lime blocks are the payoff half of the statement and the part
        // people recognise at thumbnail size, so they stay blocks here rather
        // than being flattened to plain text.
        ...(emphasis
          ? {
              alignSelf: 'flex-start',
              background: LIME,
              color: CARBON,
              borderRadius: 12,
              padding: '8px 18px',
            }
          : { color: ALABASTER, padding: '2px 0' }),
      },
    },
    text
  )
}

function card() {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: CARBON,
        // 630px is a hard ceiling: Satori does not scroll, it clips, and an
        // overflowing tagline is simply gone. The type scale is sized against
        // that budget rather than chosen for its own sake.
        padding: 52,
        fontFamily: 'Cabinet Grotesk',
      },
    },
    // Echoes the hero header: mark, rule, wordmark.
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 20 } },
      h('img', { src: markDataUri, width: 64, height: 64, alt: '' }),
      h('div', { style: { display: 'flex', flex: 1, height: 1, background: '#FAFBFA4D' } }),
      h(
        'div',
        { style: { display: 'flex', fontSize: 22, color: ALABASTER, letterSpacing: 1 } },
        'NORNGROWTHDESIGN'
      )
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      ...heroHeadline.map(headlineLine)
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: 24,
          color: PLATINUM,
          maxWidth: 820,
          lineHeight: 1.3,
        },
      },
      heroTagline
    )
  )
}

const response = new ImageResponse(card(), {
  ...SIZE,
  fonts: [
    { name: 'Cabinet Grotesk', data: cabinetGrotesk, weight: 900, style: 'normal' },
  ],
})

writeFileSync(join(root, OUTPUT), Buffer.from(await response.arrayBuffer()))
console.log(`generated ${OUTPUT} (${SIZE.width}x${SIZE.height})`)
