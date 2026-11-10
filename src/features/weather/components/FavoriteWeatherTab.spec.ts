import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService } from '@/services'
import type { LocationModel } from '@/models'
import FavoriteWeatherTab from './FavoriteWeatherTab.vue'

const kyiv = { lat: 50.45, lon: 30.52 }
const lviv = { lat: 49.84, lon: 24.03 }

function mountTab(favorites: LocationModel[]) {
  return mount(FavoriteWeatherTab, {
    props: { favorites },
    global: {
      plugins: [i18n],
      stubs: { TemperatureChart: true },
    },
    attachTo: document.body,
  })
}

const removeButtons = (wrapper: ReturnType<typeof mountTab>) =>
  wrapper.findAll('button').filter(button => button.text().includes('Remove'))

describe('FavoriteWeatherTab', () => {
  beforeEach(() => {
    vi.spyOn(GeoapifyApiService, 'getCityDetails').mockResolvedValue({ ok: true, data: null })
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockReturnValue(new Promise(() => {}))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('shows one card per Favorite, each with a "Remove" button and the Day / 5 days switch', async () => {
    const wrapper = mountTab([kyiv, lviv])
    await flushPromises()

    expect(wrapper.findAll('section.city-card')).toHaveLength(2)
    expect(removeButtons(wrapper)).toHaveLength(2)
    expect(wrapper.findAll('[role="group"][aria-label="Forecast view"]')).toHaveLength(2)
  })

  it('shows no city search, no heart and no delete button', async () => {
    const wrapper = mountTab([kyiv])
    await flushPromises()

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Use my location"]').exists()).toBe(false)
    const hearts = wrapper.findAll('button[aria-pressed]').filter(button => button.text().startsWith('favorite'))
    expect(hearts).toHaveLength(0)
    expect(wrapper.find('button[aria-label="Delete card"]').exists()).toBe(false)
  })

  it('asks to remove the Favorite when "Remove" is clicked', async () => {
    const wrapper = mountTab([kyiv, lviv])
    await flushPromises()

    await removeButtons(wrapper)[1].trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[lviv]])
  })

  it('keeps "Remove" when the forecast fails', async () => {
    vi.mocked(WeatherApiService.get5Days3HoursForecast)
      .mockResolvedValue({ ok: false, error: { kind: 'timeout', message: 'timeout' } })
    const wrapper = mountTab([kyiv])
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(removeButtons(wrapper)).toHaveLength(1)
  })

  it('explains how to save a Favorite when there are none', () => {
    const wrapper = mountTab([])

    expect(wrapper.find('section.city-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('No favorite cities yet')
    expect(wrapper.text()).toContain('Tap the heart on a city card on the Main tab to keep it here. You can save up to 5.')
  })
})
