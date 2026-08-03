import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatFlowSection } from './chat-flow-section'
import {
  chatFlowEyebrow,
  chatFlowHeading,
  chatFlowSubheading,
  chatPhases,
} from '@/lib/chat-flow-script'

describe('ChatFlowSection', () => {
  it('renders the eyebrow, heading and subheading', () => {
    render(<ChatFlowSection />)

    expect(screen.getByText(chatFlowEyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: chatFlowHeading })
    ).toBeInTheDocument()
    expect(screen.getByText(chatFlowSubheading)).toBeInTheDocument()
  })

  it('renders all four phase labels', () => {
    render(<ChatFlowSection />)

    expect(screen.getByText('01 · DESCOBRIR')).toBeInTheDocument()
    expect(screen.getByText('02 · DEFINIR')).toBeInTheDocument()
    expect(screen.getByText('03 · DESENVOLVER')).toBeInTheDocument()
    expect(screen.getByText('04 · ENTREGAR')).toBeInTheDocument()
  })

  it('renders every line of every message', () => {
    render(<ChatFlowSection />)

    for (const phase of chatPhases) {
      for (const message of phase.messages) {
        for (const line of message.lines) {
          if (message.emphasis && line.includes(message.emphasis)) continue
          expect(screen.getByText(line)).toBeInTheDocument()
        }
      }
    }
  })

  it('emphasises the key terms inside their bubbles', () => {
    render(<ChatFlowSection />)

    expect(screen.getByText('onboarding')).toBeInTheDocument()
    expect(screen.getByText('+22% de ativação.')).toBeInTheDocument()
    expect(
      screen.getByText(/8 hipóteses, ICE score decide:/)
    ).toBeInTheDocument()
    expect(screen.getByText(/shipando!/)).toBeInTheDocument()
  })

  it('renders both attachments', () => {
    render(<ChatFlowSection />)

    expect(screen.getByText('backlog-hipoteses.pdf')).toBeInTheDocument()
    expect(screen.getByText('onboarding-teste-ab.md')).toBeInTheDocument()
  })

  it('renders the reaction pill', () => {
    render(<ChatFlowSection />)

    expect(screen.getByText('2 🔥')).toBeInTheDocument()
  })

  it('renders one avatar per message plus the trailing typing indicator', () => {
    render(<ChatFlowSection />)

    const nornMessages = chatPhases
      .flatMap((phase) => phase.messages)
      .filter((message) => message.sender === 'norn')

    expect(screen.getAllByTestId('norn-mark')).toHaveLength(
      nornMessages.length
    )
  })

  it('closes with a typing indicator', () => {
    render(<ChatFlowSection />)

    expect(screen.getByTestId('chat-flow-typing')).toBeInTheDocument()
  })
})
