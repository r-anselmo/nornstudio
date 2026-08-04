import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { heroHeadline, heroTagline } from '@/lib/hero'

/**
 * The share card, drawn from the same copy the hero renders.
 *
 * `force-static` is required, not optional: with `output: export` there is no
 * server to generate this on request, and Next refuses to build the route
 * without it rather than silently shipping a broken URL.
 */
export const dynamic = 'force-static'
export const alt = 'Norn — todo mundo fala em estratégia. A gente executa.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Satori rasterises with the fonts it is handed and nothing else — there is no
 * document to inherit from. Cabinet Grotesk ships as OTF, which it reads;
 * General Sans is WOFF2 only, which it cannot, so the tagline is set in the
 * heading face at a lighter size rather than in a font that would silently
 * fall back to something generic.
 */
const cabinetGrotesk = readFileSync(
  join(process.cwd(), 'app/fonts/cabinet-grotesk/CabinetGrotesk-Black.otf')
)

const mark = readFileSync(join(process.cwd(), 'app/icon.svg'), 'utf8')
const markDataUri = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`

const LIME = '#C6F432'
const CARBON = '#1D1E18'
const ALABASTER = '#FAFBFA'
const PLATINUM = '#C7C7C5'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: CARBON,
          // 630px is a hard ceiling — Satori does not scroll, it clips, and an
          // overflowing tagline is simply gone. The type scale below is sized
          // against that budget, not chosen for its own sake.
          padding: 52,
          fontFamily: 'Cabinet Grotesk',
        }}
      >
        {/* Echoes the hero header: mark, rule, status. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* A plain img, not next/image: this tree is rasterised by Satori at
              build time, never mounted in a browser, so there is no runtime to
              optimise for. */}
          <img src={markDataUri} width={64} height={64} alt="" />
          <div style={{ display: 'flex', flex: 1, height: 1, background: '#FAFBFA4D' }} />
          <div style={{ display: 'flex', fontSize: 22, color: ALABASTER, letterSpacing: 1 }}>
            NORNGROWTHDESIGN
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {heroHeadline.map(({ text, emphasis }) => (
            <div
              key={text}
              style={{
                display: 'flex',
                fontSize: 54,
                lineHeight: 1,
                letterSpacing: 1,
                // The lime blocks are the payoff half of the statement, so they
                // are drawn as blocks here too rather than flattened to plain
                // text — it is the part people recognise at thumbnail size.
                ...(emphasis
                  ? {
                      alignSelf: 'flex-start',
                      background: LIME,
                      color: CARBON,
                      borderRadius: 12,
                      padding: '8px 18px',
                    }
                  : { color: ALABASTER, padding: '2px 0' }),
              }}
            >
              {text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: PLATINUM, maxWidth: 820, lineHeight: 1.3 }}>
          {heroTagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Cabinet Grotesk',
          data: cabinetGrotesk,
          weight: 900,
          style: 'normal',
        },
      ],
    }
  )
}
