import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService, type RequestResult } from '@/services'
import type { LocationModel } from '@/models'
import WeatherFeature from './WeatherFeature.vue'

function pending<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

function mountFeature() {
  return mount(WeatherFeature, {
    global: {
      plugins: [i18n],
      stubs: { TemperatureChart: true },
    },
    attachTo: document.body,
  })
}

describe('WeatherFeature', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('shows a loading placeholder on the Main tab until the IP Location is found', async () => {
    const ipLocation = pending<RequestResult<LocationModel>>()
    vi.spyOn(GeoapifyApiService, 'getIpLocation').mockReturnValue(ipLocation.promise)
    vi.spyOn(GeoapifyApiService, 'getCityDetails').mockResolvedValue({ ok: true, data: null })
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockReturnValue(new Promise(() => {}))
    const wrapper = mountFeature()
    await flushPromises()

    const placeholder = wrapper.find('[role="tabpanel"] [aria-busy="true"]')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toContain('Finding your location')
    expect(wrapper.find('input').exists()).toBe(false)

    ipLocation.resolve({ ok: true, data: { lat: 50.45, lon: 30.52 } })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Finding your location')
    expect(wrapper.find('input').exists()).toBe(true)
  })
})
