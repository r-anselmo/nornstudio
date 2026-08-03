import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NornBadge } from './norn-badge'

describe('NornBadge', () => {
  it('puts the mark on a lime tile', () => {
    const { container } = render(<NornBadge />)

    const tile = container.firstElementChild
    expect(tile?.className).toContain('bg-lime')
    expect(screen.getByTestId('norn-mark')).toBeInTheDocument()
  })

  it('carries no text, so nothing announces a stray letter', () => {
    const { container } = render(<NornBadge />)

    expect(container.textContent).toBe('')
  })

  it('lets a caller override the radius without stacking both', () => {
    const { container } = render(<NornBadge className="rounded-xl" />)

    const tile = container.firstElementChild
    expect(tile?.className).toContain('rounded-xl')
    // twMerge has to drop the default, or the two radii fight in the cascade.
    expect(tile?.className).not.toContain('rounded-lg')
  })
})
