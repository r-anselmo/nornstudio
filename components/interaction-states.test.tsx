import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServicesSection } from './services-section'
import { SiteFooter } from './site-footer'
import { WhatWeDoSection } from './what-we-do-section'

vi.mock('@/components/LiquidEther', () => ({ default: () => null }))

describe('interaction states', () => {
  it('gives every footer link a visible focus ring', () => {
    render(<SiteFooter />)

    for (const link of screen.getAllByRole('link')) {
      expect(link.className).toContain('focus-ring')
    }
  })

  it('lifts the service cards on hover', () => {
    const { container } = render(<ServicesSection />)

    const cards = container.querySelectorAll('[data-spotlight-card]')
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.className).toContain('hover:-translate-y-0.5')
      // A transform with no reduced-motion escape hatch is the exact thing
      // the media query exists to suppress.
      expect(card.className).toContain('motion-reduce:transition-none')
    }
  })

  it('responds to hover on the skill chips', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('UI/UX').parentElement?.className).toContain(
      'hover:bg-alabaster/20'
    )
  })
})
