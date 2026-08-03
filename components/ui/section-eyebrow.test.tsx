import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionEyebrow } from './section-eyebrow'

describe('SectionEyebrow', () => {
  it('renders its label', () => {
    render(<SectionEyebrow>Como fazemos</SectionEyebrow>)

    expect(screen.getByText('Como fazemos')).toBeInTheDocument()
  })

  it('draws lime brackets by default, for the dark sections', () => {
    render(<SectionEyebrow>Como fazemos</SectionEyebrow>)

    const eyebrow = screen.getByText('Como fazemos')
    expect(eyebrow).toHaveClass('text-lime')
    for (const bracket of eyebrow.querySelectorAll('span')) {
      expect(bracket.className).toContain('border-lime')
    }
  })

  it('draws carbon brackets on the lime section', () => {
    render(<SectionEyebrow tone="carbon">Vamos começar</SectionEyebrow>)

    const eyebrow = screen.getByText('Vamos começar')
    expect(eyebrow).toHaveClass('text-carbon-black')
    for (const bracket of eyebrow.querySelectorAll('span')) {
      expect(bracket.className).toContain('border-carbon-black')
    }
  })

  it('hides the brackets from assistive technology', () => {
    render(<SectionEyebrow>Como fazemos</SectionEyebrow>)

    const brackets = screen
      .getByText('Como fazemos')
      .querySelectorAll('[aria-hidden="true"]')
    expect(brackets).toHaveLength(2)
  })
})
