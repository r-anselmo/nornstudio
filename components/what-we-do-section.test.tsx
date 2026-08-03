import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatWeDoSection } from './what-we-do-section'

describe('WhatWeDoSection', () => {
  it('renders the eyebrow tag', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('O que estamos fazendo')).toBeInTheDocument()
  })

  it('renders the manifesto card', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('manifesto.txt')).toBeInTheDocument()
    expect(screen.getByText('Decidimos o caminho.')).toBeInTheDocument()
    expect(screen.getByText('Movemos o crescimento.')).toBeInTheDocument()
    expect(
      screen.getByText(/Growth que nasce da escuta/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText('NORNGROWTHDESIGN · SINCE 2026')
    ).toBeInTheDocument()
  })

  it('renders all six skills', () => {
    render(<WhatWeDoSection />)

    const skills = [
      'UI/UX',
      'Prototyping',
      'Growth',
      'Systems',
      'Data-Driven-Design',
      'Research',
    ]
    for (const skill of skills) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })

  it('renders the currently-building card', () => {
    render(<WhatWeDoSection />)

    expect(screen.getByText('CLAUDE CODE & FIGMA')).toBeInTheDocument()
    for (const tag of ['Claude Code', 'Figma', 'Amplitude']) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
  })
})
