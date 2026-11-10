import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService, type RequestResult } from '@/services'
import type { ForecastModel, WeatherList } from '@/models'
import CityCard from './CityCard.vue'
import TemperatureChart from './TemperatureChart.vue'
import { forecastItems, utc } from '../../test-support/forecast-items'

const kyiv = { lat: 50.45, lon: 30.52 }

const slot = {
  dt: 1762776000,
  dt_txt: '2025-11-10 12:00:00',
  main: { temp: 7, feels_like: 5, pressure: 1012, humidity: 80 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 3, deg: 90 },
  visibility: 10000,
} as unknown as WeatherList

const forecast: RequestResult<ForecastModel> = { ok: true, data: { list: [slot], timezoneOffset: 7200 } }
const failed: RequestResult<ForecastModel> = { ok: false, error: { kind: 'timeout', message: 'timeout' } }

function pending<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

function mountCard() {
  return mount(CityCard, {
    props: { cityLocation: kyiv },
    global: {
      plugins: [i18n],
      stubs: { TemperatureChart: true },
    },
    attachTo: document.body,
  })
}

const tryAgainButton = (wrapper: ReturnType<typeof mountCard>) =>
  wrapper.findAll('button').find(button => button.text().includes('Try again'))

// Mounted components outlive their test otherwise, and a locale change would make them load for real.
enableAutoUnmount(afterEach)

describe('CityCard', () => {
  beforeEach(() => {
    vi.spyOn(GeoapifyApiService, 'getCityDetails')
      .mockResolvedValue({ ok: true, data: { ...kyiv, place_id: 'kyiv', cityLabel: 'Kyiv, Ukraine' } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('shows loading placeholders while the forecast loads', async () => {
    const request = pending<RequestResult<ForecastModel>>()
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockReturnValue(request.promise)
    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading forecast')

    request.resolve(forecast)
    await flushPromises()

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Loading forecast')
  })

  it('shows the error with "Try again" when the forecast fails', async () => {
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(failed)
    const wrapper = mountCard()
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain("Couldn't load the forecast")
    expect(tryAgainButton(wrapper)).toBeDefined()
    expect(wrapper.text()).toContain('Kyiv, Ukraine')
  })

  it('loads the forecast again on "Try again" and shows it', async () => {
    const getForecast = vi.spyOn(WeatherApiService, 'get5Days3HoursForecast')
      .mockResolvedValueOnce(failed)
      .mockResolvedValueOnce(forecast)
    const wrapper = mountCard()
    await flushPromises()

    await tryAgainButton(wrapper)!.trigger('click')
    await flushPromises()

    expect(getForecast).toHaveBeenCalledTimes(2)
    expect(getForecast).toHaveBeenLastCalledWith({ ...kyiv, lang: 'en' })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Temperature')
  })

  it('shows the forecast for the city picked last when an older answer arrives late', async () => {
    const lviv = { lat: 49.84, lon: 24.03 }
    const kyivRequest = pending<RequestResult<ForecastModel>>()
    const lvivRequest = pending<RequestResult<ForecastModel>>()
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast')
      .mockReturnValueOnce(kyivRequest.promise)
      .mockReturnValueOnce(lvivRequest.promise)
    const wrapper = mountCard()
    await flushPromises()

    await wrapper.setProps({ cityLocation: lviv })
    lvivRequest.resolve(forecast)
    await flushPromises()
    kyivRequest.resolve(failed)
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Loading forecast')
  })

  describe("in the city's local time", () => {
    beforeEach(() => {
      // Only Date is faked, so promises and the test-utils flush still run.
      vi.useFakeTimers({ toFake: ['Date'], now: utc('2025-11-10T12:20:00') })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // The API gives Kyiv (UTC+2) slots from 12:00 UTC: 14:00 local onwards.
    const kyivForecast: RequestResult<ForecastModel> = {
      ok: true,
      data: { list: forecastItems('2025-11-10T12:00:00', 16), timezoneOffset: 7200 },
    }

    it('shows the current conditions with the local date and time', async () => {
      vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(kyivForecast)
      const wrapper = mountCard()
      await flushPromises()

      expect(wrapper.text()).toContain('overcast clouds · Feels like −2°')
      expect(wrapper.text()).toContain('Mon, Nov 10 · 14:20 local time')
    })

    it("shows today's local times in the Day table and gives them to the chart", async () => {
      vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(kyivForecast)
      const wrapper = mountCard()
      await flushPromises()

      const timeRow = wrapper.findAll('tbody tr')[0]
      expect(timeRow.findAll('td').map(td => td.text()))
        .toEqual(['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
      expect(wrapper.findComponent(TemperatureChart).props()).toEqual({
        viewMode: 'day',
        labels: ['14:00', '17:00', '20:00', '23:00'],
        temperatures: [0, 1, 2, 3],
      })
    })

    it('switches between "Day" and "5 days", with one chart bar per Daily average', async () => {
      vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(kyivForecast)
      const wrapper = mountCard()
      await flushPromises()

      const switchLabels = wrapper.findAll('[role="group"] button').map(button => button.text())
      expect(switchLabels).toEqual(['Day', '5 days'])
      await wrapper.findAll('button').find(button => button.text() === '5 days')!.trigger('click')

      // Today 14:00–23:00 local is 0–3 (mean 1.5), the 11th is 4–11 (7.5), the 12th 12–15 (13.5).
      expect(wrapper.findAll('.five-day-forecast li')).toHaveLength(3)
      expect(wrapper.find('tbody').exists()).toBe(false)
      expect(wrapper.findComponent(TemperatureChart).props()).toEqual({
        viewMode: 'fiveDays',
        labels: ['Today', 'Tue 11', 'Wed 12'],
        temperatures: [2, 8, 14],
      })

      await wrapper.findAll('button').find(button => button.text() === 'Day')!.trigger('click')
      expect(wrapper.find('.five-day-forecast').exists()).toBe(false)
      expect(wrapper.findComponent(TemperatureChart).props('viewMode')).toBe('day')
    })
  })

  it('sends the city name it loaded along with the heart click', async () => {
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(forecast)
    const wrapper = mountCard()
    await flushPromises()

    await wrapper.find('button[aria-label="Add to favorites"]').trigger('click')

    expect(wrapper.emitted('toggleFavorite')).toEqual([['Kyiv, Ukraine']])
  })

  it('names the city in its delete confirmation', async () => {
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(forecast)
    const wrapper = mountCard()
    await flushPromises()

    await wrapper.find('button[aria-label="Delete card"]').trigger('click')

    expect(wrapper.find('dialog h2').text()).toBe('Delete the Kyiv, Ukraine card?')
  })

  describe('with no Location yet', () => {
    it('invites the user to pick a city and loads no forecast', async () => {
      const getForecast = vi.spyOn(WeatherApiService, 'get5Days3HoursForecast')
      const wrapper = mount(CityCard, { global: { plugins: [i18n] }, attachTo: document.body })
      await flushPromises()

      const empty = wrapper.find('.city-card__empty')
      expect(empty.text()).toContain('Pick a city')
      expect(empty.text()).toContain('Type at least 3 letters, or use your location.')
      expect(wrapper.find('input[role="combobox"]').exists()).toBe(true)
      expect(wrapper.find('button[aria-label="Add to favorites"]').exists()).toBe(false)
      expect(getForecast).not.toHaveBeenCalled()
    })

    it('says it in Ukrainian too', async () => {
      i18n.global.locale.value = 'uk'
      try {
        const wrapper = mount(CityCard, { global: { plugins: [i18n] }, attachTo: document.body })
        await flushPromises()

        expect(wrapper.find('.city-card__empty').text()).toContain('Оберіть місто')
      } finally {
        i18n.global.locale.value = 'en'
      }
    })

    it('drops the invitation once a Location is set', async () => {
      vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockResolvedValue(forecast)
      const wrapper = mount(CityCard, {
        global: { plugins: [i18n], stubs: { TemperatureChart: true } },
        attachTo: document.body,
      })

      await wrapper.setProps({ cityLocation: kyiv })
      await flushPromises()

      expect(wrapper.find('.city-card__empty').exists()).toBe(false)
    })
  })
})
