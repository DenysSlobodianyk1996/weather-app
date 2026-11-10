import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, WeatherApiService, type RequestResult } from '@/services'
import type { LocationModel } from '@/models'
import { FAVORITE_CITIES_KEY } from '@/static'
import WeatherFeature from './WeatherFeature.vue'

const kyiv = { lat: 50.45, lon: 30.52 }
// Kyiv again, with other digits after the 2nd decimal place.
const kyivAgain = { lat: 50.4512, lon: 30.5188 }

function pending<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

function saveFavorites(favorites: LocationModel[]) {
  localStorage.setItem(FAVORITE_CITIES_KEY, JSON.stringify(favorites))
}

function mockIpLocation(result: Promise<RequestResult<LocationModel>> | LocationModel) {
  const value = result instanceof Promise ? result : Promise.resolve({ ok: true as const, data: result })
  vi.spyOn(GeoapifyApiService, 'getIpLocation').mockReturnValue(value)
}

async function mountFeature() {
  const wrapper = mount(WeatherFeature, {
    global: {
      plugins: [i18n],
      stubs: { TemperatureChart: true },
    },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountFeature>>

const panel = (wrapper: Wrapper) => wrapper.find('[role="tabpanel"]')
const tab = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('[role="tab"]').find(button => button.text().startsWith(name))!
const buttonWithText = (wrapper: Wrapper, text: string) =>
  wrapper.findAll('button').find(button => button.text().includes(text))
const hearts = (wrapper: Wrapper) =>
  panel(wrapper).findAll('button[aria-pressed]').filter(button => button.text().startsWith('favorite'))

const openModal = (wrapper: Wrapper) => wrapper.findAll('dialog').find(dialog => dialog.attributes('open') !== undefined)
const modalTitle = (wrapper: Wrapper, modal: ReturnType<Wrapper['find']>) =>
  wrapper.find(`#${modal.attributes('aria-labelledby')}`).text()

function fillFavorites() {
  saveFavorites([1, 2, 3, 4, 5].map(n => ({ lat: n, lon: n })))
}

async function openTab(wrapper: Wrapper, name: string) {
  await tab(wrapper, name).trigger('click')
  await flushPromises()
}

describe('WeatherFeature', () => {
  beforeEach(() => {
    vi.spyOn(GeoapifyApiService, 'getCityDetails').mockImplementation(async ({ lat, lon }) => ({
      ok: true,
      data: lat === kyiv.lat && lon === kyiv.lon ? { ...kyiv, place_id: 'kyiv', cityLabel: 'Kyiv, Ukraine' } : null,
    }))
    vi.spyOn(WeatherApiService, 'get5Days3HoursForecast').mockReturnValue(new Promise(() => {}))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('shows a loading placeholder on the Main tab until the IP Location is found', async () => {
    const ipLocation = pending<RequestResult<LocationModel>>()
    mockIpLocation(ipLocation.promise)
    const wrapper = await mountFeature()

    const placeholder = wrapper.find('[role="tabpanel"] [aria-busy="true"]')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toContain('Finding your location')
    expect(wrapper.find('input').exists()).toBe(false)

    ipLocation.resolve({ ok: true, data: kyiv })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Finding your location')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('keeps a card added before the IP Location arrives empty, and fills only the first card', async () => {
    const ipLocation = pending<RequestResult<LocationModel>>()
    mockIpLocation(ipLocation.promise)
    const wrapper = await mountFeature()

    await buttonWithText(wrapper, 'Add city')!.trigger('click')
    ipLocation.resolve({ ok: true, data: kyiv })
    await flushPromises()

    const cards = panel(wrapper).findAll('section.city-card')
    expect(cards).toHaveLength(2)
    // Only a card with a Location has a heart: the new card stays empty.
    expect(cards[0].find('button[aria-pressed]').exists()).toBe(false)
    expect(cards[1].find('button[aria-label="Add to favorites"]').exists()).toBe(true)
  })

  it('fills the heart when the IP Location is the same place as a saved Favorite', async () => {
    saveFavorites([kyivAgain])
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    expect(hearts(wrapper).map(heart => heart.attributes('aria-pressed'))).toEqual(['true'])
  })

  it('keeps the hearts on both tabs in sync', async () => {
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    await panel(wrapper).find('button[aria-label="Add to favorites"]').trigger('click')
    expect(hearts(wrapper).map(heart => heart.attributes('aria-pressed'))).toEqual(['true'])
    expect(tab(wrapper, 'Favorites').text()).toContain('1')

    await openTab(wrapper, 'Favorites')
    expect(panel(wrapper).findAll('section.city-card')).toHaveLength(1)
    expect(panel(wrapper).find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('1 of 5 favorites')

    await buttonWithText(wrapper, 'Remove')!.trigger('click')
    expect(panel(wrapper).find('section.city-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('No favorite cities yet')

    await openTab(wrapper, 'Main')
    expect(hearts(wrapper).map(heart => heart.attributes('aria-pressed'))).toEqual(['false'])
    expect(JSON.parse(localStorage.getItem(FAVORITE_CITIES_KEY)!)).toEqual([])
  })

  it('shows Favorites saved by the old version, once per place', async () => {
    saveFavorites([kyiv, kyivAgain, { lat: 49.84, lon: 24.03 }])
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    expect(tab(wrapper, 'Favorites').text()).toContain('2')
    await openTab(wrapper, 'Favorites')
    expect(panel(wrapper).findAll('section.city-card')).toHaveLength(2)
  })

  it('shows the City cards limit modal when a 6th card is added', async () => {
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    for(let i = 0; i < 5; i++) {
      await buttonWithText(wrapper, 'Add city')!.trigger('click')
    }
    await flushPromises()

    expect(panel(wrapper).findAll('section.city-card')).toHaveLength(5)
    expect(wrapper.text()).toContain('5 of 5 cities')
    const modal = openModal(wrapper)!
    expect(modalTitle(wrapper, modal)).toBe('City cards are full')
    expect(modal.text()).toContain('You can show up to 5 cities on the Main tab. Delete a card to add another one.')
    expect(modal.findAll('button').map(button => button.text())).toEqual(['OK'])

    await modal.find('button').trigger('click')
    await flushPromises()
    expect(openModal(wrapper)).toBeUndefined()
  })

  it('shows the Favorites limit modal naming the city when a 6th Favorite is saved', async () => {
    fillFavorites()
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    await panel(wrapper).find('button[aria-label="Add to favorites"]').trigger('click')
    await flushPromises()

    expect(hearts(wrapper).map(heart => heart.attributes('aria-pressed'))).toEqual(['false'])
    expect(tab(wrapper, 'Favorites').text()).toContain('5')
    const modal = openModal(wrapper)!
    expect(modalTitle(wrapper, modal)).toBe('Favorites are full')
    expect(modal.text()).toContain('You can keep up to 5 favorite cities. To add Kyiv, Ukraine, remove one of your favorites first.')
    expect(modal.findAll('button').map(button => button.text())).toEqual(['Open Favorites', 'OK'])

    await buttonWithText(modal as unknown as Wrapper, 'OK')!.trigger('click')
    await flushPromises()
    expect(openModal(wrapper)).toBeUndefined()
    expect(tab(wrapper, 'Main').attributes('aria-selected')).toBe('true')
  })

  it('opens the Favorites tab from the Favorites limit modal', async () => {
    fillFavorites()
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    await panel(wrapper).find('button[aria-label="Add to favorites"]').trigger('click')
    await flushPromises()
    await buttonWithText(openModal(wrapper) as unknown as Wrapper, 'Open Favorites')!.trigger('click')
    await flushPromises()

    expect(openModal(wrapper)).toBeUndefined()
    expect(tab(wrapper, 'Favorites').attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tab(wrapper, 'Favorites').element)
    expect(wrapper.text()).toContain('5 of 5 favorites')
  })

  it('closes the limit modals on Escape', async () => {
    fillFavorites()
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    await panel(wrapper).find('button[aria-label="Add to favorites"]').trigger('click')
    await flushPromises()
    await openModal(wrapper)!.trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(openModal(wrapper)).toBeUndefined()

    for(let i = 0; i < 5; i++) {
      await buttonWithText(wrapper, 'Add city')!.trigger('click')
    }
    await flushPromises()
    await openModal(wrapper)!.trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(openModal(wrapper)).toBeUndefined()
  })

  it('never falls back to alert() for the limits', async () => {
    const alert = vi.fn()
    vi.stubGlobal('alert', alert)
    fillFavorites()
    mockIpLocation(kyiv)
    const wrapper = await mountFeature()

    await panel(wrapper).find('button[aria-label="Add to favorites"]').trigger('click')
    for(let i = 0; i < 5; i++) {
      await buttonWithText(wrapper, 'Add city')!.trigger('click')
    }

    expect(alert).not.toHaveBeenCalled()
  })
})
