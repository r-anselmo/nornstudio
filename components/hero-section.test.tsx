import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { HeroSection } from './hero-section'
import { ContactDialogProvider } from './contact-dialog-provider'

const { liquidEtherMock } = vi.hoisted(() => ({
  liquidEtherMock: vi.fn<(props: unknown) => null>(() => null),
}))

vi.mock('@/components/LiquidEther', () => ({
  default: (props: unknown) => liquidEtherMock(props),
}))

function renderHero() {
  return render(
    <ContactDialogProvider>
      <HeroSection />
    </ContactDialogProvider>
  )
}

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
    renderHero()

    expect(screen.getByText('TODO MUNDO')).toBeInTheDocument()
    expect(screen.getByText('FALA EM')).toBeInTheDocument()
    expect(screen.getByText('ESTRATÉGIA.')).toBeInTheDocument()
    expect(screen.getByText('A GENTE')).toBeInTheDocument()
    expect(screen.getByText('EXECUTA.')).toBeInTheDocument()
    expect(
      screen.getByText(/Do experimento ao resultado/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Iniciar Projeto/i })
    ).toBeInTheDocument()
    // `vitest.setup.ts` sets `__NEXT_TRAILING_SLASH` to mirror
    // next.config.ts's `trailingSlash: true`, so `next/link` appends the
    // slash here exactly as it would in a real build.
    expect(
      screen.getByRole('link', { name: 'O Tear' })
    ).toHaveAttribute('href', '/tear/')
  })

  it('renders the logo mark', () => {
    renderHero()

    expect(screen.getByTestId('norn-mark')).toBeInTheDocument()
  })

  it('renders the bottom info row', () => {
    renderHero()

    expect(screen.getByText('ATUANDO GLOBALMENTE')).toBeInTheDocument()
    expect(
      screen.getByText('SEM ESCRITÓRIO, POR OPÇÃO')
    ).toBeInTheDocument()
    expect(screen.getByText('AGENDA ABERTA, 2026')).toBeInTheDocument()
    expect(screen.getByText('NO SEU FUSO-HORÁRIO')).toBeInTheDocument()
  })

  it('mounts the LiquidEther background', () => {
    renderHero()
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(liquidEtherMock).toHaveBeenCalled()
  })
})
