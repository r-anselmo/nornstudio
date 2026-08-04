import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { heroHeadline, heroTagline, siteUrl } from './hero'

const root = join(__dirname, '..')
const script = readFileSync(join(root, 'scripts/generate-og-image.mjs'), 'utf8')
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')
const card = readFileSync(join(root, 'public/opengraph-image.png'))

/** Width and height out of the PNG's IHDR chunk, as big-endian uint32s. */
function pngSize(file: Buffer) {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
}

describe('hero copy', () => {
  it('marks the payoff lines for the lime block treatment', () => {
    expect(
      heroHeadline.filter((line) => line.emphasis).map((line) => line.text)
    ).toEqual(['A GENTE', 'EXECUTA.'])
  })

  it('keeps the headline to the five lines both layouts are sized for', () => {
    // The share card budgets its type against this count, and Satori clips
    // rather than scrolling — a sixth line would vanish with no warning.
    expect(heroHeadline).toHaveLength(5)
  })

  it('has a tagline short enough to survive as a meta description', () => {
    expect(heroTagline.length).toBeLessThanOrEqual(160)
  })
})

describe('the Open Graph card', () => {
  it('is a valid 1200x630 PNG', () => {
    expect(card.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
    expect(pngSize(card)).toEqual({ width: 1200, height: 630 })
  })

  it('draws its copy from lib/hero rather than inlining it', () => {
    // The whole reason lib/hero.ts exists. Inlined words here would let the
    // share card and the page quietly disagree.
    expect(script).toContain("from '../lib/hero.ts'")
    expect(script).not.toContain('TODO MUNDO')
    expect(script).not.toContain('Do experimento')
  })

  it('is referenced with its .png extension', () => {
    // GitHub Pages types by extension. The metadata file convention would have
    // served this at an extensionless /opengraph-image, which Pages labels
    // application/octet-stream and every scraper then refuses.
    expect(layout).toContain('/opengraph-image.png')
  })

  it('is advertised at an absolute URL', () => {
    // Open Graph consumers do not resolve relative paths, and a static export
    // has no request to infer an origin from.
    expect(layout).toContain('metadataBase')
    expect(siteUrl.startsWith('https://')).toBe(true)
  })
})
