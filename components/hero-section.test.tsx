import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './hero-section'

vi.mock('@/components/LiquidEther', () => ({
  default: () => null,
}))

describe('HeroSection', () => {
  it('renders the headline, subtext, and both CTAs', () => {
    render(<HeroSection />)

    expect(screen.getByText('TODO MUNDO')).toBeInTheDocument()
    expect(screen.getByText('FALA EM')).toBeInTheDocument()
    expect(screen.getByText('ESTRATÉGIA.')).toBeInTheDocument()
    expect(screen.getByText('A GENTE')).toBeInTheDocument()
    expect(screen.getByText('EXECUTA.')).toBeInTheDocument()
    expect(
      screen.getByText(/Do experimento ao resultado/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Iniciar Projeto/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver serviços' })
    ).toBeInTheDocument()
  })
})
