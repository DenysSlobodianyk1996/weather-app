import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { API, clearRequestCache, httpClient, request } from './request.service'

const MINUTE = 60 * 1000

describe('request', () => {
  let mock: MockAdapter

  beforeAll(() => {
    mock = new MockAdapter(httpClient)
  })

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-10T12:00:00Z'))
  })

  afterEach(() => {
    mock.reset()
    clearRequestCache()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  afterAll(() => {
    mock.restore()
  })

  it('resolves to an ok result with the response data', async () => {
    mock.onGet('/thing').reply(200, { value: 1 })

    const result = await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    expect(result).toEqual({ ok: true, data: { value: 1 } })
  })

  it('maps the response data with parse', async () => {
    mock.onGet('/thing').reply(200, { value: 1 })

    const result = await request({ api: 'geoapify', url: '/thing', ttl: 0, parse: (raw: any) => raw.value + 1 })

    expect(result).toEqual({ ok: true, data: 2 })
  })

  it('serves a repeated request from the cache while it is fresh', async () => {
    mock.onGet('/thing').reply(200, { value: 1 })
    const options = { api: 'geoapify' as const, url: '/thing', params: { q: 'a' }, ttl: 10 * MINUTE }

    const first = await request(options)
    vi.advanceTimersByTime(10 * MINUTE - 1)
    const second = await request(options)

    expect(second).toEqual(first)
    expect(mock.history.get).toHaveLength(1)
  })

  it('fetches again once the cache entry has expired', async () => {
    mock.onGet('/thing').replyOnce(200, { value: 1 }).onGet('/thing').replyOnce(200, { value: 2 })
    const options = { api: 'geoapify' as const, url: '/thing', ttl: 10 * MINUTE }

    await request(options)
    vi.advanceTimersByTime(10 * MINUTE)
    const second = await request(options)

    expect(second).toEqual({ ok: true, data: { value: 2 } })
    expect(mock.history.get).toHaveLength(2)
  })

  it('keeps an entry with an infinite ttl for the life of the page', async () => {
    mock.onGet('/thing').reply(200, { value: 1 })
    const options = { api: 'geoapify' as const, url: '/thing', ttl: Infinity }

    await request(options)
    vi.advanceTimersByTime(24 * 60 * MINUTE)
    await request(options)

    expect(mock.history.get).toHaveLength(1)
  })

  it('caches by url and params, not by object identity', async () => {
    mock.onGet('/thing').reply(200, {})

    await request({ api: 'geoapify', url: '/thing', params: { q: 'a' }, ttl: Infinity })
    await request({ api: 'geoapify', url: '/thing', params: { q: 'a' }, ttl: Infinity })
    await request({ api: 'geoapify', url: '/thing', params: { q: 'b' }, ttl: Infinity })
    await request({ api: 'geoapify', url: '/other', params: { q: 'a' }, ttl: Infinity })

    expect(mock.history.get).toHaveLength(3)
  })

  it('does not cache failures', async () => {
    mock.onGet('/thing').replyOnce(500).onGet('/thing').replyOnce(200, { value: 1 })
    const options = { api: 'geoapify' as const, url: '/thing', ttl: Infinity }

    const first = await request(options)
    const second = await request(options)

    expect(first.ok).toBe(false)
    expect(second).toEqual({ ok: true, data: { value: 1 } })
  })

  it('shares one HTTP call between identical requests made at the same time', async () => {
    mock.onGet('/thing').reply(200, { value: 1 })
    const options = { api: 'geoapify' as const, url: '/thing', params: { q: 'a' }, ttl: 0 }

    const [first, second] = await Promise.all([request(options), request(options)])

    expect(first).toEqual({ ok: true, data: { value: 1 } })
    expect(second).toEqual(first)
    expect(mock.history.get).toHaveLength(1)
  })

  it('sends a new request once the shared one has failed', async () => {
    mock.onGet('/thing').replyOnce(500).onGet('/thing').replyOnce(200, { value: 1 })
    const options = { api: 'geoapify' as const, url: '/thing', ttl: Infinity }

    const [first, second] = await Promise.all([request(options), request(options)])
    const third = await request(options)

    expect(first.ok).toBe(false)
    expect(second).toEqual(first)
    expect(third).toEqual({ ok: true, data: { value: 1 } })
    expect(mock.history.get).toHaveLength(2)
  })

  it('waits 10 seconds before timing out', async () => {
    mock.onGet('/thing').reply(200, {})

    await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    expect(mock.history.get[0].timeout).toBe(10_000)
  })

  it('reports a timeout as an error result', async () => {
    mock.onGet('/thing').timeout()

    const result = await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    expect(result).toMatchObject({ ok: false, error: { kind: 'timeout' } })
  })

  it('reports a network failure as an error result', async () => {
    mock.onGet('/thing').networkError()

    const result = await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    expect(result).toMatchObject({ ok: false, error: { kind: 'network' } })
  })

  it('reports an HTTP error status as an error result', async () => {
    mock.onGet('/thing').reply(401, { message: 'Invalid API key' })

    const result = await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    expect(result).toMatchObject({ ok: false, error: { kind: 'http', status: 401 } })
  })

  it('reports a response it cannot parse as an error result', async () => {
    mock.onGet('/thing').reply(200, {})

    const result = await request({
      api: 'geoapify',
      url: '/thing',
      ttl: Infinity,
      parse: (raw: any) => raw.missing.value,
    })

    expect(result).toMatchObject({ ok: false, error: { kind: 'invalid-response' } })
  })

  it('sends each API to its own base URL with its own key', async () => {
    vi.stubEnv('VITE_OPEN_WEATHER_KEY', 'weather-key')
    vi.stubEnv('VITE_GEOAPIFY_KEY', 'geo-key')
    mock.onGet('/thing').reply(200, {})

    await request({ api: 'openWeather', url: '/thing', params: { q: 'a' }, ttl: 0 })
    await request({ api: 'geoapify', url: '/thing', ttl: 0 })

    const [weatherCall, geoCall] = mock.history.get
    expect(weatherCall.baseURL).toBe(API.openWeather.baseURL)
    expect(weatherCall.params).toEqual({ q: 'a', appid: 'weather-key' })
    expect(geoCall.baseURL).toBe(API.geoapify.baseURL)
    expect(geoCall.params).toEqual({ apiKey: 'geo-key' })
  })
})
