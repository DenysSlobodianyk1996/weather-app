import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService, type RequestResult } from '@/services'
import type { ForecastModel, WeatherList } from '@/models'
import CityCard from './CityCard.vue'

const kyiv = { lat: 50.45, lon: 30.52 }

const slot = {
  dt: 1762776000,
  dt_txt: '2025-11-10 12:00:00',
  dt_txt_day: '2025-11-10',
  dt_txt_time: '12:00:00',
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
})
