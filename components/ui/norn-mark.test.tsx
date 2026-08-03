import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NornMark } from './norn-mark'

function renderMark(className?: string) {
  const { container } = render(<NornMark className={className} />)
  const svg = container.querySelector('svg')
  if (!svg) throw new Error('mark did not render')
  return svg
}

describe('NornMark', () => {
  it('is decorative', () => {
    expect(renderMark()).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes its colour from the caller', () => {
    const svg = renderMark('text-carbon-black/10')

    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveClass('text-carbon-black/10')
  })

  it('is framed to the glyph, not the artwork board', () => {
    const svg = renderMark()

    // The source file is a 1080x1080 board; framing to the glyph's own bounding
    // box is what keeps positioning predictable when it bleeds off an edge.
    expect(svg).toHaveAttribute('viewBox', '176 189 724 725')
    expect(svg.querySelector('rect')).toBeNull()
  })

  it('draws the glyph as a single filled path', () => {
    const paths = renderMark().querySelectorAll('path')

    expect(paths).toHaveLength(1)
    expect(paths[0].getAttribute('d')).toMatch(/^M819\.999 194C/)
  })
})
