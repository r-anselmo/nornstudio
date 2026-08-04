import { describe, it, expect } from 'vitest'
import { isValid, validateContact } from './validate-contact'

const good = {
  name: 'Rodrigo',
  email: 'rodrigo@deployux.com',
  message: 'A conversão do onboarding caiu 30% no último mês.',
}

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    expect(validateContact(good)).toEqual({})
    expect(isValid(validateContact(good))).toBe(true)
  })

  it('rejects a blank name', () => {
    expect(validateContact({ ...good, name: '   ' })).toHaveProperty('name')
  })

  it('rejects an address with no domain', () => {
    expect(validateContact({ ...good, email: 'rodrigo@' })).toHaveProperty(
      'email'
    )
  })

  it('rejects an address with no at sign', () => {
    expect(
      validateContact({ ...good, email: 'rodrigo.deployux.com' })
    ).toHaveProperty('email')
  })

  it('rejects a message too short to act on', () => {
    expect(validateContact({ ...good, message: 'oi' })).toHaveProperty(
      'message'
    )
  })

  it('does not count surrounding whitespace towards the message length', () => {
    expect(
      validateContact({ ...good, message: '   oi     ' })
    ).toHaveProperty('message')
  })

  it('reports every problem at once rather than one at a time', () => {
    const errors = validateContact({ name: '', email: 'x', message: '' })

    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
    expect(isValid(errors)).toBe(false)
  })
})
