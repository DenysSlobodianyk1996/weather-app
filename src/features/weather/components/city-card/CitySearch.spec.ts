import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService, type RequestResult } from '@/services'
import type { SearchCitiesResultModel } from '@/models'
import CitySearch from './CitySearch.vue'

const DEBOUNCE_MS = 500

function pending<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

const city = (cityLabel: string): SearchCitiesResultModel => ({ lat: 1, lon: 2, place_id: cityLabel, cityLabel })

async function type(wrapper: ReturnType<typeof mount>, text: string) {
  const input = wrapper.find('input')
  await input.trigger('focus')
  await input.setValue(text)
}

async function waitForDebounce() {
  vi.advanceTimersByTime(DEBOUNCE_MS)
  await flushPromises()
}

describe('CitySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  function mountSearch() {
    return mount(CitySearch, { global: { plugins: [i18n] }, attachTo: document.body })
  }

  it('shows a placeholder while searching, then the cities found', async () => {
    const search = pending<RequestResult<SearchCitiesResultModel[]>>()
    vi.spyOn(GeoapifyApiService, 'searchCities').mockReturnValue(search.promise)
    const wrapper = mountSearch()

    await type(wrapper, 'Kyi')
    await waitForDebounce()
    expect(wrapper.find('.search-city__results [aria-busy="true"]').exists()).toBe(true)

    search.resolve({ ok: true, data: [city('Kyiv, Ukraine')] })
    await flushPromises()

    expect(wrapper.find('.search-city__results').text()).toBe('Kyiv, Ukraine')
  })

  it('says the search failed when it does', async () => {
    vi.spyOn(GeoapifyApiService, 'searchCities').mockResolvedValue({ ok: false, error: { kind: 'network', message: 'Network Error' } })
    const wrapper = mountSearch()

    await type(wrapper, 'Kyi')
    await waitForDebounce()

    expect(wrapper.find('.search-city__results').text()).toBe("Couldn't search cities")
  })

  it('ignores results for older text that arrive after the user typed more', async () => {
    const shortSearch = pending<RequestResult<SearchCitiesResultModel[]>>()
    const longSearch = pending<RequestResult<SearchCitiesResultModel[]>>()
    vi.spyOn(GeoapifyApiService, 'searchCities')
      .mockReturnValueOnce(shortSearch.promise)
      .mockReturnValueOnce(longSearch.promise)
    const wrapper = mountSearch()

    await type(wrapper, 'Lvi')
    await waitForDebounce()
    await type(wrapper, 'Lviv')
    await waitForDebounce()

    longSearch.resolve({ ok: true, data: [city('Lviv, Ukraine')] })
    await flushPromises()
    shortSearch.resolve({ ok: true, data: [city('Lvivka, Ukraine')] })
    await flushPromises()

    expect(wrapper.find('.search-city__results').text()).toBe('Lviv, Ukraine')
  })
})
