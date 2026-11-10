import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { clearRequestCache, httpClient } from './request.service'
import { WeatherApiService } from './weather-api.service'

const FORECAST_URL = '/2.5/forecast'
const MINUTE = 60 * 1000

describe('WeatherApiService.get5Days3HoursForecast', () => {
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
  })

  afterAll(() => {
    mock.restore()
  })

  it('returns the forecast list as the API gives it', async () => {
    mock.onGet(FORECAST_URL).reply(200, {
      list: [{ dt: 1, dt_txt: '2026-11-10 15:00:00' }],
      city: { timezone: 7200 },
    })

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 1, lon: 1, lang: 'en' })

    if(!result.ok) throw new Error('expected an ok result')
    expect(result.data.list).toHaveLength(1)
    expect(result.data.list[0]).toEqual({ dt: 1, dt_txt: '2026-11-10 15:00:00' })
  })

  it("returns the city's time-zone offset in seconds", async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [], city: { timezone: 7200 } })

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 1, lon: 1, lang: 'en' })

    expect(result).toEqual({ ok: true, data: { list: [], timezoneOffset: 7200 } })
  })

  it('requests metric units for the given location and language', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [], city: { timezone: 0 } })

    await WeatherApiService.get5Days3HoursForecast({ lat: 2, lon: 3, lang: 'uk' })

    expect(mock.history.get[0].params).toMatchObject({ lat: 2, lon: 3, lang: 'uk', units: 'metric' })
  })

  it('reports a failed request as an error result', async () => {
    mock.onGet(FORECAST_URL).networkError()

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 4, lon: 4, lang: 'en' })

    expect(result).toMatchObject({ ok: false, error: { kind: 'network' } })
  })

  it('reports a response without a forecast list as an error result', async () => {
    mock.onGet(FORECAST_URL).reply(200, {})

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 4, lon: 4, lang: 'en' })

    expect(result).toMatchObject({ ok: false, error: { kind: 'invalid-response' } })
  })

  it('reports a response without a time-zone offset as an error result', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [] })

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 4, lon: 4, lang: 'en' })

    expect(result).toMatchObject({ ok: false, error: { kind: 'invalid-response' } })
  })

  it('serves repeated requests for the same params from the cache', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [{ dt: 1, dt_txt: '2026-11-10 18:00:00' }], city: { timezone: 0 } })
    const request = { lat: 5, lon: 5, lang: 'en' }

    const first = await WeatherApiService.get5Days3HoursForecast(request)
    const second = await WeatherApiService.get5Days3HoursForecast(request)

    expect(second).toEqual(first)
    expect(mock.history.get).toHaveLength(1)
  })

  it('fetches the forecast again after 10 minutes', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [], city: { timezone: 0 } })
    const request = { lat: 6, lon: 6, lang: 'en' }

    await WeatherApiService.get5Days3HoursForecast(request)
    vi.advanceTimersByTime(10 * MINUTE - 1)
    await WeatherApiService.get5Days3HoursForecast(request)
    expect(mock.history.get).toHaveLength(1)

    vi.advanceTimersByTime(1)
    await WeatherApiService.get5Days3HoursForecast(request)
    expect(mock.history.get).toHaveLength(2)
  })
})
