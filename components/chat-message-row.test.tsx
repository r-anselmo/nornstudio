import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessageRow } from './chat-message-row'

// Reveal sequencing lives in the conversation cursor and is covered by
// chat-conversation.test.tsx. These cover the row's own rendering.
describe('ChatMessageRow', () => {
  it('renders its children with no conversation around it', () => {
    render(
      <ChatMessageRow index={0} sender="client">
        Queremos escalar
      </ChatMessageRow>
    )

    expect(screen.getByTestId('chat-row')).toHaveAttribute(
      'data-phase',
      'initial'
    )
    expect(screen.getByText('Queremos escalar')).toBeInTheDocument()
  })

  it('marks a norn message with the lime bubble edge and the N avatar', () => {
    render(
      <ChatMessageRow index={0} sender="norn">
        Qual métrica te tira o sono hoje?
      </ChatMessageRow>
    )

    expect(screen.getByText('N')).toBeInTheDocument()
    expect(
      screen.getByText('Qual métrica te tira o sono hoje?').parentElement
        ?.className
    ).toContain('border-r-lime')
  })

  it('renders a footer alongside the bubble', () => {
    render(
      <ChatMessageRow index={0} sender="norn" footer={<span>2 🔥</span>}>
        Protótipo pronto.
      </ChatMessageRow>
    )

    expect(screen.getByText('2 🔥')).toBeInTheDocument()
    expect(screen.getByText('Protótipo pronto.')).toBeInTheDocument()
  })
})
