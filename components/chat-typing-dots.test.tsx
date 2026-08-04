import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatTypingDots } from './chat-message-row'

describe('ChatTypingDots', () => {
  it('bounces rather than pulsing like a loading skeleton', () => {
    const { container } = render(
      <span data-testid="dots">
        <ChatTypingDots />
      </span>
    )

    const dots = container.querySelectorAll('span[style]')
    expect(dots).toHaveLength(3)
    for (const dot of dots) {
      expect(dot.className).toContain('animate-chat-typing')
      expect(dot.className).not.toContain('animate-pulse')
    }
  })

  it('offsets each dot so the bounce travels along the row', () => {
    const { container } = render(<ChatTypingDots />)

    const delays = Array.from(container.querySelectorAll('span[style]')).map(
      (dot) => (dot as HTMLElement).style.animationDelay
    )
    expect(delays).toEqual(['0ms', '160ms', '320ms'])
  })

  it('stays out of the accessibility tree', () => {
    render(
      <span data-testid="wrapper">
        <ChatTypingDots />
      </span>
    )

    expect(
      screen.getByTestId('wrapper').firstElementChild
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
