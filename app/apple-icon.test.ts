import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const png = readFileSync(join(__dirname, 'apple-icon.png'))
const source = readFileSync(join(__dirname, '..', 'design', 'apple-icon.svg'), 'utf8')

/**
 * Width and height out of the IHDR chunk: 8-byte signature, 4-byte length,
 * 4-byte type, then the two dimensions as big-endian uint32s.
 */
function pngSize(file: Buffer) {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
}

describe('app/apple-icon.png', () => {
  it('is a real PNG, not an SVG that got renamed', () => {
    // iOS silently ignores a home screen icon it cannot decode, and the only
    // symptom is a blank tile — worth catching here instead.
    expect(png.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  })

  it('is 180x180, the size iOS asks for', () => {
    expect(pngSize(png)).toEqual({ width: 180, height: 180 })
  })
})

describe('design/apple-icon.svg', () => {
  it('is full bleed, because iOS rounds the corners itself', () => {
    // A pre-rounded source gets masked twice and shows a transparent notch at
    // every corner. app/icon.svg is the rounded one; this must not be.
    expect(source).toContain('<rect width="1024" height="1024" fill="#C6F432"/>')
    expect(source).not.toContain('rx=')
  })

  it('keeps its XML comments free of the double hyphen CoreSVG rejects', () => {
    // `--` is illegal inside an XML comment and makes sips refuse the file
    // outright, so the regeneration recipe lives in design/README.md.
    for (const comment of source.match(/<!--[\s\S]*?-->/g) ?? []) {
      expect(comment.slice(4, -3)).not.toContain('--')
    }
  })
})
