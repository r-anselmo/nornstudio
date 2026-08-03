import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CtaSection } from './cta-section'
import {
  ctaEyebrow,
  ctaHeading,
  ctaHref,
  ctaLabel,
  ctaSubheading,
} from '@/lib/cta'

describe('CtaSection', () => {
  it('renders the eyebrow, heading and supporting copy', () => {
    render(<CtaSection />)

    expect(screen.getByText(ctaEyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: ctaHeading })
    ).toBeInTheDocument()
    expect(screen.getByText(ctaSubheading)).toBeInTheDocument()
  })

  it('renders the call to action as a link', () => {
    render(<CtaSection />)

    const link = screen.getByRole('link', { name: new RegExp(ctaLabel) })
    expect(link).toHaveAttribute('href', ctaHref)
  })

  it('inverts the palette: lime surface, carbon type', () => {
    const { container } = render(<CtaSection />)

    const section = container.querySelector('section')
    expect(section?.className).toContain('bg-lime')
    expect(screen.getByRole('heading', { level: 2 }).className).toContain(
      'text-carbon-black'
    )
    // The eyebrow has to switch tone too, or it vanishes into the lime.
    expect(screen.getByText(ctaEyebrow)).toHaveClass('text-carbon-black')
  })

  it('answers the hero link that points at #contato', () => {
    const { container } = render(<CtaSection />)

    expect(container.querySelector('section')).toHaveAttribute('id', 'contato')
  })

  it('hides the decorative mark from assistive technology', () => {
    const { container } = render(<CtaSection />)

    const mark = container.querySelector('svg')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })

  it('clips the mark to the section', () => {
    const { container } = render(<CtaSection />)

    expect(container.querySelector('section')?.className).toContain(
      'overflow-hidden'
    )
  })
})
