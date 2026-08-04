import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MARK_PATH } from '@/components/ui/norn-mark'

const icon = readFileSync(join(__dirname, 'icon.svg'), 'utf8')
const raster = readFileSync(join(__dirname, 'icon.png'))

/** Width and height out of the PNG's IHDR chunk, as big-endian uint32s. */
function pngSize(file: Buffer) {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
}

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

describe('app/icon.png', () => {
  it('exists as a raster fallback, because Safari cannot render SVG favicons', () => {
    // Shipping SVG only meant Safari ignored the tag, probed /favicon.ico,
    // got a 404, and kept showing whatever it had cached. Both are declared
    // now and each browser takes the one it understands.
    expect(raster.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  })

  it('is square and big enough for a retina tab', () => {
    expect(pngSize(raster)).toEqual({ width: 192, height: 192 })
  })
})
