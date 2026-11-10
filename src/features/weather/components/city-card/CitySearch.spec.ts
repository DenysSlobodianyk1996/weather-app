import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
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

const city = (cityLabel: string, lat = 1, lon = 2): SearchCitiesResultModel => ({ lat, lon, place_id: cityLabel, cityLabel })

const lvivResults = [
  city('Lviv, Lviv Oblast, Ukraine', 49.84, 24.03),
  city('Lvivka, Zaporizhzhia Oblast, Ukraine', 47.1, 35.2),
  city('Lviv, Arkansas, United States', 35.3, -92.1),
]

async function type(wrapper: ReturnType<typeof mount>, text: string) {
  const input = wrapper.find('input')
  await input.trigger('focus')
  await input.setValue(text)
}

async function waitForDebounce() {
  vi.advanceTimersByTime(DEBOUNCE_MS)
  await flushPromises()
}

// Mounted components outlive their test otherwise, and a locale change would make them load for real.
enableAutoUnmount(afterEach)

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

  it('sends no search once the text drops below 3 letters before the delay ends', async () => {
    const searchCities = vi.spyOn(GeoapifyApiService, 'searchCities')
    const wrapper = mountSearch()

    await type(wrapper, 'Lvi')
    await wrapper.find('input').setValue('Lv')
    await waitForDebounce()

    expect(searchCities).not.toHaveBeenCalled()
    expect(wrapper.find('.search-city__results').exists()).toBe(false)
  })

  it('sends no search after it is gone', async () => {
    const searchCities = vi.spyOn(GeoapifyApiService, 'searchCities')
    const wrapper = mountSearch()

    await type(wrapper, 'Lvi')
    wrapper.unmount()
    await waitForDebounce()

    expect(searchCities).not.toHaveBeenCalled()
  })

  describe('results', () => {
    async function openResults(results = lvivResults, text = 'Lvi') {
      vi.spyOn(GeoapifyApiService, 'searchCities').mockResolvedValue({ ok: true, data: results })
      const wrapper = mountSearch()
      await type(wrapper, text)
      await waitForDebounce()
      return wrapper
    }

    const options = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[role="option"]')
    const input = (wrapper: ReturnType<typeof mount>) => wrapper.find('input')
    const press = (wrapper: ReturnType<typeof mount>, key: string) => input(wrapper).trigger('keydown', { key })
    const activeLabel = (wrapper: ReturnType<typeof mount>) => {
      const id = input(wrapper).attributes('aria-activedescendant')
      return id ? wrapper.find(`[id="${id}"]`).text() : undefined
    }

    it('bolds the first match in each result, ignoring case', async () => {
      const wrapper = await openResults(lvivResults, 'lVI')

      expect(options(wrapper).map(option => option.findAll('strong').map(strong => strong.text())))
        .toEqual([['Lvi'], ['Lvi'], ['Lvi']])
      expect(options(wrapper)[0].text()).toBe('Lviv, Lviv Oblast, Ukraine')
    })

    it('bolds Ukrainian matches', async () => {
      const wrapper = await openResults([city('Київ, Україна')], 'киї')

      expect(options(wrapper)[0].find('strong').text()).toBe('Киї')
    })

    it('shows the typed text as text, never as markup', async () => {
      const wrapper = await openResults([city('<img src=x onerror=alert(1)>, Nowhere')], '<img')

      expect(options(wrapper)[0].find('img').exists()).toBe(false)
      expect(options(wrapper)[0].find('strong').text()).toBe('<img')
    })

    it('is a combobox that controls a listbox of options', async () => {
      const wrapper = await openResults()
      const listbox = wrapper.find('[role="listbox"]')

      expect(input(wrapper).attributes('role')).toBe('combobox')
      expect(input(wrapper).attributes('aria-expanded')).toBe('true')
      expect(input(wrapper).attributes('aria-controls')).toBe(listbox.attributes('id'))
      expect(listbox.attributes('aria-label')).toBe('Cities')
      expect(options(wrapper)).toHaveLength(3)
    })

    it('is collapsed before 3 letters are typed', async () => {
      const searchCities = vi.spyOn(GeoapifyApiService, 'searchCities')
      const wrapper = mountSearch()

      await type(wrapper, 'Lv')
      await waitForDebounce()

      expect(searchCities).not.toHaveBeenCalled()
      expect(input(wrapper).attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('.search-city__results').exists()).toBe(false)
      expect(wrapper.find('.search-city__hint').text()).toBe('Please type at least 3 characters')
    })

    it('starts on the first result and moves with the arrow keys, wrapping at the ends', async () => {
      const wrapper = await openResults()
      expect(activeLabel(wrapper)).toBe('Lviv, Lviv Oblast, Ukraine')
      expect(options(wrapper).map(option => option.attributes('aria-selected'))).toEqual(['true', 'false', 'false'])

      await press(wrapper, 'ArrowDown')
      expect(activeLabel(wrapper)).toBe('Lvivka, Zaporizhzhia Oblast, Ukraine')
      expect(options(wrapper).map(option => option.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])

      await press(wrapper, 'ArrowDown')
      await press(wrapper, 'ArrowDown')
      expect(activeLabel(wrapper)).toBe('Lviv, Lviv Oblast, Ukraine')

      await press(wrapper, 'ArrowUp')
      expect(activeLabel(wrapper)).toBe('Lviv, Arkansas, United States')
    })

    it('picks the active result on Enter and clears the field', async () => {
      const wrapper = await openResults()

      await press(wrapper, 'ArrowDown')
      await press(wrapper, 'Enter')

      expect(wrapper.emitted('select')).toEqual([[{ lat: 47.1, lon: 35.2 }]])
      expect((input(wrapper).element as HTMLInputElement).value).toBe('')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('picks a result on click', async () => {
      const wrapper = await openResults()

      await options(wrapper)[2].trigger('click')

      expect(wrapper.emitted('select')).toEqual([[{ lat: 35.3, lon: -92.1 }]])
    })

    it('closes the list when focus moves out with Tab', async () => {
      const wrapper = await openResults()
      const nextButton = document.createElement('button')
      document.body.append(nextButton)

      await input(wrapper).trigger('focusout', { relatedTarget: nextButton })

      expect(wrapper.find('.search-city__results').exists()).toBe(false)
      expect(input(wrapper).attributes('aria-expanded')).toBe('false')
    })

    it('keeps the list open while focus stays inside it', async () => {
      const wrapper = await openResults()

      await input(wrapper).trigger('focusout', { relatedTarget: options(wrapper)[1].element })

      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('closes the list on Escape and keeps the text', async () => {
      const wrapper = await openResults()

      await press(wrapper, 'Escape')

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(input(wrapper).attributes('aria-expanded')).toBe('false')
      expect(input(wrapper).attributes('aria-activedescendant')).toBeUndefined()
      expect((input(wrapper).element as HTMLInputElement).value).toBe('Lvi')

      await press(wrapper, 'Enter')
      expect(wrapper.emitted('select')).toBeUndefined()

      await press(wrapper, 'ArrowDown')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
      expect(activeLabel(wrapper)).toBe('Lviv, Lviv Oblast, Ukraine')
    })

    it('opens the list again when the user types after Escape', async () => {
      const wrapper = await openResults()

      await press(wrapper, 'Escape')
      await input(wrapper).setValue('Lviv')
      await waitForDebounce()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('does nothing on Enter while the results are loading', async () => {
      vi.spyOn(GeoapifyApiService, 'searchCities').mockReturnValue(pending<RequestResult<SearchCitiesResultModel[]>>().promise)
      const wrapper = mountSearch()

      await type(wrapper, 'Lvi')
      await press(wrapper, 'Enter')

      expect(wrapper.emitted('select')).toBeUndefined()
      expect(input(wrapper).attributes('aria-activedescendant')).toBeUndefined()
    })
  })

  it('clears the search when the language changes', async () => {
    vi.spyOn(GeoapifyApiService, 'searchCities').mockResolvedValue({ ok: true, data: lvivResults })
    const wrapper = mountSearch()
    await type(wrapper, 'Lvi')
    await waitForDebounce()

    i18n.global.locale.value = 'uk'
    await flushPromises()

    try {
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
      expect(wrapper.find('.search-city__results').exists()).toBe(false)
    } finally {
      i18n.global.locale.value = 'en'
    }
  })
})
