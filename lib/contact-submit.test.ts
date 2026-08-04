import { describe, it, expect, afterEach, vi } from 'vitest'
import { submitContact } from './contact-submit'
import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from './contact'

const submission = {
  name: '  Rodrigo  ',
  email: '  rodrigo@deployux.com ',
  message: '  A conversão caiu 30%.  ',
  botcheck: '',
}

function stubFetch(response: { ok: boolean } | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response as Response)
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function bodyOf(fetchMock: ReturnType<typeof stubFetch>) {
  return JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitContact', () => {
  it('posts to Web3Forms with the access key', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(fetchMock.mock.calls[0][0]).toBe(WEB3FORMS_ENDPOINT)
    expect(bodyOf(fetchMock).access_key).toBe(WEB3FORMS_ACCESS_KEY)
  })

  it('trims the values before sending them', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    const body = bodyOf(fetchMock)
    expect(body.name).toBe('Rodrigo')
    expect(body.email).toBe('rodrigo@deployux.com')
    expect(body.message).toBe('A conversão caiu 30%.')
  })

  it('sets replyto so a reply reaches the sender directly', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(bodyOf(fetchMock).replyto).toBe('rodrigo@deployux.com')
  })

  it('names the sender in the subject line', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact(submission)

    expect(bodyOf(fetchMock).subject).toBe('Novo projeto — Rodrigo')
  })

  it('forwards the honeypot so Web3Forms can drop bot submissions', async () => {
    const fetchMock = stubFetch({ ok: true })

    await submitContact({ ...submission, botcheck: 'on' })

    expect(bodyOf(fetchMock).botcheck).toBe('on')
  })

  it('reports failure when the endpoint rejects the submission', async () => {
    stubFetch({ ok: false })

    expect(await submitContact(submission)).toEqual({ ok: false })
  })

  it('reports failure when the network is unreachable', async () => {
    stubFetch(new Error('offline'))

    // A thrown fetch and a 500 leave the visitor in the same position, so the
    // caller gets one branch rather than two.
    expect(await submitContact(submission)).toEqual({ ok: false })
  })

  it('reports success when the endpoint accepts it', async () => {
    stubFetch({ ok: true })

    expect(await submitContact(submission)).toEqual({ ok: true })
  })
})
