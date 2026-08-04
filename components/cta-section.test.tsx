import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CtaSection } from './cta-section'
import { ContactDialogProvider } from './contact-dialog-provider'
import { ctaEyebrow, ctaHeading, ctaLabel, ctaSubheading } from '@/lib/cta'

function renderCta() {
  return render(
    <ContactDialogProvider>
      <CtaSection />
    </ContactDialogProvider>
  )
}

describe('CtaSection', () => {
  it('renders the eyebrow, heading and supporting copy', () => {
    renderCta()

    expect(screen.getByText(ctaEyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: ctaHeading })
    ).toBeInTheDocument()
    expect(screen.getByText(ctaSubheading)).toBeInTheDocument()
  })

  it('opens the contact dialog rather than navigating', () => {
    renderCta()

    // It opens a dialog, so it is a button. A link here would promise a
    // destination that does not exist.
    expect(
      screen.getByRole('button', { name: new RegExp(ctaLabel) })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: new RegExp(ctaLabel) })).toBeNull()
  })

  it('inverts the palette: lime surface, carbon type', () => {
    const { container } = renderCta()

    const section = container.querySelector('section')
    expect(section?.className).toContain('bg-lime')
    expect(screen.getByRole('heading', { level: 2 }).className).toContain(
      'text-carbon-black'
    )
    // The eyebrow has to switch tone too, or it vanishes into the lime.
    expect(screen.getByText(ctaEyebrow)).toHaveClass('text-carbon-black')
  })

  it('answers the hero link that points at #contato', () => {
    const { container } = renderCta()

    expect(container.querySelector('section')).toHaveAttribute('id', 'contato')
  })

  it('hides the decorative mark from assistive technology', () => {
    const { container } = renderCta()

    const mark = container.querySelector('section svg')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })

  it('leaves the mark upright', () => {
    const { container } = renderCta()

    // `className` on an SVG element is an SVGAnimatedString, not a string.
    const classes =
      container.querySelector('section svg')?.getAttribute('class') ?? ''

    // A tilted logo reads as a broken image, not as decoration.
    expect(classes).not.toMatch(/rotate|skew|-scale/)
  })

  it('clips the mark to the section', () => {
    const { container } = renderCta()

    expect(container.querySelector('section')?.className).toContain(
      'overflow-hidden'
    )
  })
})
