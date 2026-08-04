import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MARK_PATH } from '@/components/ui/norn-mark'

const icon = readFileSync(join(__dirname, 'icon.svg'), 'utf8')

describe('app/icon.svg', () => {
  it('draws the real mark, not an approximation of it', () => {
    // The favicon has to inline the geometry rather than render NornMark, so
    // nothing but this test stops it drifting from the logo on the page.
    expect(icon).toContain(MARK_PATH)
  })

  it('carries the lime tile, so the mark is visible on any tab bar', () => {
    // A single-colour mark disappears into whichever browser chrome matches
    // it. The tile brings its own contrast.
    expect(icon).toContain('#C6F432')
    expect(icon).toContain('#1D1E18')
  })

  it('is square, so no browser letterboxes it', () => {
    expect(icon).toContain('viewBox="0 0 1024 1024"')
  })

  it('is not left as a decorative image with no name', () => {
    expect(icon).toContain('aria-label="Norn"')
  })
})
