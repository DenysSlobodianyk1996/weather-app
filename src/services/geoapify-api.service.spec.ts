import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { clearRequestCache, httpClient } from './request.service'
import { GeoapifyApiService } from './geoapify-api.service'

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

describe('GeoapifyApiService', () => {
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

  describe('getIpLocation', () => {
    it('returns the Location of the IP address', async () => {
      mock.onGet('ipinfo').reply(200, { location: { latitude: 50.45, longitude: 30.52 } })

      const result = await GeoapifyApiService.getIpLocation()

      expect(result).toEqual({ ok: true, data: { lat: 50.45, lon: 30.52 } })
    })

    it('is cached for the life of the page', async () => {
      mock.onGet('ipinfo').reply(200, { location: { latitude: 50.45, longitude: 30.52 } })

      await GeoapifyApiService.getIpLocation()
      vi.advanceTimersByTime(DAY)
      await GeoapifyApiService.getIpLocation()

      expect(mock.history.get).toHaveLength(1)
    })

    it('reports a failed lookup as an error result', async () => {
      mock.onGet('ipinfo').timeout()

      const result = await GeoapifyApiService.getIpLocation()

      expect(result).toMatchObject({ ok: false, error: { kind: 'timeout' } })
    })

    it('reports a response without a location as an error result', async () => {
      mock.onGet('ipinfo').reply(200, {})

      const result = await GeoapifyApiService.getIpLocation()

      expect(result).toMatchObject({ ok: false, error: { kind: 'invalid-response' } })
    })
  })

  describe('getCityDetails', () => {
    const cityFeature = {
      properties: { lat: 50.45, lon: 30.52, place_id: 'p1', city: 'Kyiv', country: 'Ukraine' },
    }

    it('returns the city label for the Location', async () => {
      mock.onGet('geocode/reverse').reply(200, { features: [cityFeature] })

      const result = await GeoapifyApiService.getCityDetails({ lat: 50.45, lon: 30.52, lang: 'en' })

      expect(result).toEqual({
        ok: true,
        data: { lat: 50.45, lon: 30.52, place_id: 'p1', cityLabel: 'Kyiv, Ukraine' },
      })
      expect(mock.history.get[0].params).toMatchObject({ lat: 50.45, lon: 30.52, lang: 'en', type: 'city' })
    })

    it('returns null data when no city is found', async () => {
      mock.onGet('geocode/reverse').reply(200, { features: [] })

      const result = await GeoapifyApiService.getCityDetails({ lat: 0, lon: 0, lang: 'en' })

      expect(result).toEqual({ ok: true, data: null })
    })

    it('is cached for the life of the page', async () => {
      mock.onGet('geocode/reverse').reply(200, { features: [cityFeature] })
      const request = { lat: 50.45, lon: 30.52, lang: 'en' }

      await GeoapifyApiService.getCityDetails(request)
      vi.advanceTimersByTime(DAY)
      await GeoapifyApiService.getCityDetails(request)

      expect(mock.history.get).toHaveLength(1)
    })

    it('reports a failed request as an error result', async () => {
      mock.onGet('geocode/reverse').reply(500)

      const result = await GeoapifyApiService.getCityDetails({ lat: 1, lon: 1, lang: 'en' })

      expect(result).toMatchObject({ ok: false, error: { kind: 'http', status: 500 } })
    })
  })

  describe('searchCities', () => {
    it('returns matching cities without same-place duplicates', async () => {
      mock.onGet('geocode/autocomplete').reply(200, {
        features: [
          { properties: { lat: 50.45, lon: 30.52, place_id: 'p1', city: 'Kyiv', country: 'Ukraine' } },
          { properties: { lat: 50.4512, lon: 30.5188, place_id: 'p2', city: 'Kyiv', country: 'Ukraine' } },
          { properties: { lat: 49.84, lon: 24.03, place_id: 'p3', city: 'Lviv', country: 'Ukraine' } },
        ],
      })

      const result = await GeoapifyApiService.searchCities({ text: 'ky', lang: 'en' })

      if(!result.ok) throw new Error('expected an ok result')
      expect(result.data.map(city => city.cityLabel)).toEqual(['Kyiv, Ukraine', 'Lviv, Ukraine'])
      expect(mock.history.get[0].params).toMatchObject({ text: 'ky', lang: 'en', type: 'city' })
    })

    it('is cached for 10 minutes, then searched again', async () => {
      mock.onGet('geocode/autocomplete').reply(200, { features: [] })
      const search = { text: 'ky', lang: 'en' }

      await GeoapifyApiService.searchCities(search)
      vi.advanceTimersByTime(10 * MINUTE - 1)
      await GeoapifyApiService.searchCities(search)
      expect(mock.history.get).toHaveLength(1)

      vi.advanceTimersByTime(1)
      await GeoapifyApiService.searchCities(search)
      expect(mock.history.get).toHaveLength(2)
    })

    it('reports a failed search as an error result', async () => {
      mock.onGet('geocode/autocomplete').networkError()

      const result = await GeoapifyApiService.searchCities({ text: 'ky', lang: 'en' })

      expect(result).toMatchObject({ ok: false, error: { kind: 'network' } })
    })
  })
})
