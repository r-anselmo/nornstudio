import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { alt, contentType, dynamic, size } from './opengraph-image'
import { heroHeadline, heroTagline } from '@/lib/hero'

const source = readFileSync(join(__dirname, 'opengraph-image.tsx'), 'utf8')

describe('app/opengraph-image', () => {
  it('is pinned static, which output: export requires', () => {
    // Without this the build fails outright rather than shipping a broken
    // card — but it fails late, during page-data collection, so it is worth
    // catching here.
    expect(dynamic).toBe('force-static')
  })

  it('is the 1200x630 every scraper expects', () => {
    expect(size).toEqual({ width: 1200, height: 630 })
    expect(contentType).toBe('image/png')
  })

  it('describes itself for people who cannot see it', () => {
    expect(alt).toBeTruthy()
  })

  it('draws its copy from the same module the hero does', () => {
    // The whole point of lib/hero.ts. Inlining the words here instead would
    // let the share card and the page quietly disagree.
    expect(source).toContain("from '@/lib/hero'")
    expect(source).not.toContain('TODO MUNDO')
    expect(source).not.toContain('Do experimento')
  })
})

describe('lib/hero', () => {
  it('marks the payoff lines for the lime block treatment', () => {
    expect(heroHeadline.filter((line) => line.emphasis).map((l) => l.text)).toEqual([
      'A GENTE',
      'EXECUTA.',
    ])
  })

  it('keeps the headline to the five lines the layouts are sized for', () => {
    // Both the hero and the share card budget their type against this count;
    // a sixth line overflows the 630px card silently, since Satori clips.
    expect(heroHeadline).toHaveLength(5)
  })

  it('has a tagline short enough to survive as a meta description', () => {
    expect(heroTagline.length).toBeLessThanOrEqual(160)
  })
})
