import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Home from './page'

vi.mock('@/components/LiquidEther', () => ({
  default: () => null,
}))

describe('Home', () => {
  it('renders every section in order', () => {
    const { container } = render(<Home />)

    const ids = Array.from(container.querySelectorAll('section[id]')).map(
      (section) => section.id
    )
    expect(ids).toEqual(['como-fazemos', 'servicos', 'contato'])
  })

  /**
   * The hero shipped links to #contato and #servicos long before either target
   * existed, so both buttons were silent no-ops in production. This is the
   * check that would have caught it.
   */
  it('points every in-page anchor at a target that exists', () => {
    const { container } = render(<Home />)

    const anchors = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    )
      .map((anchor) => anchor.getAttribute('href') ?? '')
      // '#' is the CTA placeholder, tracked as a TODO in lib/cta.ts.
      .filter((href) => href.length > 1)

    expect(anchors.length).toBeGreaterThan(0)

    const broken = anchors.filter(
      (href) => !container.querySelector(`[id="${href.slice(1)}"]`)
    )
    expect(broken).toEqual([])
  })

  it('closes with the footer landmark', () => {
    const { container } = render(<Home />)

    const footer = container.querySelector('body > footer, :scope > footer')
    expect(footer).not.toBeNull()
  })
})
