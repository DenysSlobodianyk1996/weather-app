import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { openweathermapApi, WeatherApiService } from './weather-api.service'

const FORECAST_URL = '/2.5/forecast'

describe('WeatherApiService.get5Days3HoursForecast', () => {
  let mock: MockAdapter

  beforeAll(() => {
    mock = new MockAdapter(openweathermapApi)
    // The service logs failed requests; keep test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    mock.reset()
  })

  afterAll(() => {
    mock.restore()
    vi.restoreAllMocks()
  })

  // The service caches by params for the whole module, so each test uses its own location.

  it('splits dt_txt into dt_txt_day and dt_txt_time', async () => {
    mock.onGet(FORECAST_URL).reply(200, {
      list: [{ dt: 1, dt_txt: '2026-11-10 15:00:00' }],
    })

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 1, lon: 1, lang: 'en' })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      dt_txt: '2026-11-10 15:00:00',
      dt_txt_day: '2026-11-10',
      dt_txt_time: '15:00:00',
    })
  })

  it('requests metric units for the given location and language', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [] })

    await WeatherApiService.get5Days3HoursForecast({ lat: 2, lon: 3, lang: 'uk' })

    expect(mock.history.get[0].params).toMatchObject({ lat: 2, lon: 3, lang: 'uk', units: 'metric' })
  })

  it('resolves to an empty list when the request fails', async () => {
    mock.onGet(FORECAST_URL).networkError()

    const result = await WeatherApiService.get5Days3HoursForecast({ lat: 4, lon: 4, lang: 'en' })

    expect(result).toEqual([])
  })

  it('serves repeated requests for the same params from the cache', async () => {
    mock.onGet(FORECAST_URL).reply(200, { list: [{ dt: 1, dt_txt: '2026-11-10 18:00:00' }] })
    const request = { lat: 5, lon: 5, lang: 'en' }

    const first = await WeatherApiService.get5Days3HoursForecast(request)
    const second = await WeatherApiService.get5Days3HoursForecast(request)

    expect(second).toEqual(first)
    expect(mock.history.get).toHaveLength(1)
  })
})
