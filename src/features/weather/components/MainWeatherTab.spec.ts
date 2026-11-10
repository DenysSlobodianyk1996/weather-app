import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService } from '@/services'
import MainWeatherTab from './MainWeatherTab.vue'
import { forecastItems } from '../test-support/forecast-items'

const kyiv = { lat: 50.45, lon: 30.52 }
const lviv = { lat: 49.84, lon: 24.03 }

enableAutoUnmount(afterEach)

describe('MainWeatherTab', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('gives every element a unique id, however many City cards it shows', async () => {
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast')
      .mockResolvedValue({ ok: true, data: { list: forecastItems('2025-11-10T00:00:00', 40), timezoneOffset: 7200 } })
    vi.spyOn(GeoapifyApiService, 'getCityDetails')
      .mockResolvedValue({ ok: true, data: { ...kyiv, place_id: 'kyiv', cityLabel: 'Kyiv, Ukraine' } })
    mount(MainWeatherTab, {
      props: {
        cards: [
          { id: 1, cityLocation: kyiv, isFavorite: true },
          { id: 2, cityLocation: lviv, isFavorite: false },
          { id: 3, isFavorite: false },
        ],
      },
      global: { plugins: [i18n], stubs: { TemperatureChart: true } },
      attachTo: document.body,
    })
    await flushPromises()

    const ids = [...document.querySelectorAll('[id]')].map(element => element.id)
    // Each card has at least its search field, search hint and delete dialog title.
    expect(ids.length).toBeGreaterThanOrEqual(9)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
