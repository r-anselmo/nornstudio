import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { HeroSection } from './hero-section'

const { liquidEtherMock } = vi.hoisted(() => ({
  liquidEtherMock: vi.fn<(props: unknown) => null>(() => null),
}))

vi.mock('@/components/LiquidEther', () => ({
  default: (props: unknown) => liquidEtherMock(props),
}))

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false })
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

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

  it('renders the logo mark', () => {
    render(<HeroSection />)

    expect(screen.getByTestId('norn-mark')).toBeInTheDocument()
  })

  it('renders the bottom info row', () => {
    render(<HeroSection />)

    expect(screen.getByText('ATUANDO GLOBALMENTE')).toBeInTheDocument()
    expect(
      screen.getByText('SEM ESCRITÓRIO, POR OPÇÃO')
    ).toBeInTheDocument()
    expect(screen.getByText('AGENDA ABERTA, 2026')).toBeInTheDocument()
    expect(screen.getByText('NO SEU FUSO-HORÁRIO')).toBeInTheDocument()
  })

  it('mounts the LiquidEther background', () => {
    render(<HeroSection />)
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(liquidEtherMock).toHaveBeenCalled()
  })
})
