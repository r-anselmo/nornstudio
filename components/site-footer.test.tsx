import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { SiteFooter } from './site-footer'
import { brandSignature, footerLinks, footerTagline } from '@/lib/footer'

describe('SiteFooter', () => {
  it('is the page contentinfo landmark', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('carries the brand mark and tagline', () => {
    render(<SiteFooter />)

    expect(screen.getByTestId('norn-mark')).toBeInTheDocument()
    expect(screen.getByText(footerTagline)).toBeInTheDocument()
  })

  it('renders every nav link with its anchor', () => {
    render(<SiteFooter />)

    const nav = screen.getByRole('navigation', { name: /rodapé/i })
    for (const { href, label } of footerLinks) {
      expect(within(nav).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href
      )
    }
  })

  it('renders the legal line with the build year', () => {
    render(<SiteFooter />)

    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} NORN`)).toBeInTheDocument()
    expect(screen.getByText(brandSignature)).toBeInTheDocument()
  })

  it('reveals its content blocks like every other section', () => {
    render(<SiteFooter />)

    // The motion pass named the footer alongside hero, WhatWeDo, Services and
    // CTA; it was the one that never got wired up.
    const revealed = screen
      .getByRole('contentinfo')
      .querySelectorAll('[data-reveal]')
    expect(revealed.length).toBe(2)
  })

  it('sits on the dark surface, not the lime one', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('contentinfo').className).toContain(
      'bg-carbon-black'
    )
  })
})
