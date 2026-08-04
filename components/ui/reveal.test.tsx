import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Reveal } from './reveal'
import { MOTION_GATE_CLASS } from '@/lib/motion'

type IntersectionCallback = (
  entries: Array<{
    isIntersecting: boolean
    boundingClientRect: { top: number }
    rootBounds: { bottom: number } | null
  }>
) => void

let observers: IntersectionCallback[] = []

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []

  constructor(callback: IntersectionCallback) {
    observers.push(callback)
  }

  observe = () => {}
  unobserve = () => {}
  takeRecords = () => []
  disconnect = () => {}
}

afterEach(() => {
  observers = []
  document.documentElement.classList.remove(MOTION_GATE_CLASS)
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>conteudo</Reveal>)

    expect(screen.getByText('conteudo')).toBeInTheDocument()
  })

  it('stays pending until it enters, then flips to visible', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)
    const element = screen.getByText('conteudo')
    expect(element).toHaveAttribute('data-reveal', 'pending')

    act(() => {
      observers[0]([
        {
          isIntersecting: true,
          boundingClientRect: { top: 100 },
          rootBounds: { bottom: 800 },
        },
      ])
    })

    expect(element).toHaveAttribute('data-reveal', 'visible')
  })

  it('reveals content the visitor has already scrolled past', () => {
    document.documentElement.classList.add(MOTION_GATE_CLASS)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)

    act(() => {
      // Never reports as intersecting, so only the trigger-line check can
      // rescue it. A restored scroll position would otherwise strand it.
      observers[0]([
        {
          isIntersecting: false,
          boundingClientRect: { top: -400 },
          rootBounds: { bottom: 800 },
        },
      ])
    })

    expect(screen.getByText('conteudo')).toHaveAttribute(
      'data-reveal',
      'visible'
    )
  })

  it('never observes when the motion gate is absent', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

    render(<Reveal>conteudo</Reveal>)

    // The CSS hidden state is gated on the same class, so with no gate the
    // element is already visible and there is nothing to reveal.
    expect(observers).toHaveLength(0)
  })

  it('carries the stagger delay as a custom property', () => {
    render(<Reveal delay={180}>conteudo</Reveal>)

    expect(screen.getByText('conteudo').style.getPropertyValue('--reveal-delay')).toBe(
      '180ms'
    )
  })
})
