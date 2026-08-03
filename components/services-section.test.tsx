import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServicesSection } from './services-section'
import {
  services,
  servicesEyebrow,
  servicesHeading,
  servicesSubheading,
} from '@/lib/services'

describe('ServicesSection', () => {
  it('renders the eyebrow, heading and subheading', () => {
    render(<ServicesSection />)

    expect(screen.getByText(servicesEyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: servicesHeading })
    ).toBeInTheDocument()
    expect(screen.getByText(servicesSubheading)).toBeInTheDocument()
  })

  it('renders every service with its description', () => {
    render(<ServicesSection />)

    for (const service of services) {
      expect(
        screen.getByRole('heading', { level: 3, name: new RegExp(service.title) })
      ).toBeInTheDocument()
      expect(screen.getByText(service.description)).toBeInTheDocument()
    }
  })

  it('numbers the services in order starting at one', () => {
    render(<ServicesSection />)

    services.forEach((_, index) => {
      expect(screen.getByText(`${index + 1}.`)).toBeInTheDocument()
    })
  })

  it('answers the hero link that points at #servicos', () => {
    const { container } = render(<ServicesSection />)

    expect(container.querySelector('section')).toHaveAttribute('id', 'servicos')
  })

  it('wraps each service in a spotlight card', () => {
    const { container } = render(<ServicesSection />)

    expect(container.querySelectorAll('.spotlight-card')).toHaveLength(
      services.length
    )
    expect(screen.getByTestId('spotlight-group')).toBeInTheDocument()
  })
})
