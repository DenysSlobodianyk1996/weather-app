import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService } from '@/services'
import CityCardToolbar from './CityCardToolbar.vue'

type ToolbarProps = {
  hasLocation?: boolean
  isFavorite?: boolean
  hideRemoveAction?: boolean
  cityName?: string
}

function mountToolbar(props: ToolbarProps = {}) {
  return mount(CityCardToolbar, {
    props: { hasLocation: true, isFavorite: false, ...props },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
}

const byLabel = (label: string) => `button[aria-label="${label}"]`
const buttonIn = (wrapper: ReturnType<typeof mountToolbar>, selector: string, text: string) =>
  wrapper.find(selector).findAll('button').find(button => button.text() === text)!

describe('CityCardToolbar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('has a labelled city search field', () => {
    const wrapper = mountToolbar()
    const input = wrapper.find('input')
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`)

    expect(label.text()).toBe('Search city')
    expect(input.attributes('placeholder')).toBe('Search city')
  })

  it('gives every icon-only button a label', () => {
    const wrapper = mountToolbar()

    expect(wrapper.find(byLabel('Use my location')).exists()).toBe(true)
    expect(wrapper.find(byLabel('Add to favorites')).exists()).toBe(true)
    expect(wrapper.find(byLabel('Delete card')).exists()).toBe(true)
  })

  it('shows an empty heart that is not pressed for a card that is not a Favorite', () => {
    const wrapper = mountToolbar({ isFavorite: false })
    const heart = wrapper.find(byLabel('Add to favorites'))

    expect(heart.attributes('aria-pressed')).toBe('false')
    expect(heart.text()).toBe('favorite_border')
  })

  it('shows a filled, pressed heart for a Favorite', () => {
    const wrapper = mountToolbar({ isFavorite: true })
    const heart = wrapper.find(byLabel('Remove from favorites'))

    expect(heart.attributes('aria-pressed')).toBe('true')
    expect(heart.text()).toBe('favorite')
  })

  it('asks to toggle the Favorite when the heart is clicked', async () => {
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Add to favorites')).trigger('click')

    expect(wrapper.emitted('toggleFavorite')).toHaveLength(1)
  })

  it('hides the heart until the card has a Location', () => {
    const wrapper = mountToolbar({ hasLocation: false })

    expect(wrapper.find(byLabel('Add to favorites')).exists()).toBe(false)
  })

  it('hides the delete button when asked to', () => {
    const wrapper = mountToolbar({ hideRemoveAction: true })

    expect(wrapper.find(byLabel('Delete card')).exists()).toBe(false)
  })

  it('asks for removal only after the delete is confirmed, then closes', async () => {
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Delete card')).trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
    expect(wrapper.emitted('remove')).toBeUndefined()

    await buttonIn(wrapper, 'dialog', 'Delete').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('names the city in the delete confirmation and says it stays in Favorites', async () => {
    const wrapper = mountToolbar({ cityName: 'Lviv, Ukraine', isFavorite: true })

    await wrapper.find(byLabel('Delete card')).trigger('click')
    const dialog = wrapper.find('dialog')

    expect(wrapper.find(`#${dialog.attributes('aria-labelledby')}`).text()).toBe('Delete the Lviv, Ukraine card?')
    expect(dialog.text()).toContain('The card is removed from the Main tab. Lviv, Ukraine stays in your favorites.')
  })

  it('does not promise a Favorite that does not exist', async () => {
    const wrapper = mountToolbar({ cityName: 'Lviv, Ukraine', isFavorite: false })

    await wrapper.find(byLabel('Delete card')).trigger('click')

    expect(wrapper.find('dialog').text()).toContain('The card is removed from the Main tab.')
    expect(wrapper.find('dialog').text()).not.toContain('favorites')
  })

  it('asks about "this card" while the city name is unknown', async () => {
    const wrapper = mountToolbar({ hasLocation: false })

    await wrapper.find(byLabel('Delete card')).trigger('click')

    expect(wrapper.find('dialog h2').text()).toBe('Delete this card?')
  })

  it('closes the delete confirmation without removing on Cancel or Escape', async () => {
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Delete card')).trigger('click')
    await buttonIn(wrapper, 'dialog', 'Cancel').trigger('click')
    await flushPromises()
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()

    await wrapper.find(byLabel('Delete card')).trigger('click')
    await wrapper.find('dialog').trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()

    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('selects the IP Location when "Use my location" is clicked', async () => {
    vi.spyOn(GeoapifyApiService, 'getIpLocation').mockResolvedValue({ ok: true, data: { lat: 50.45, lon: 30.52 } })
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Use my location')).trigger('click')
    await flushPromises()

    expect(wrapper.emitted('select')).toEqual([[{ lat: 50.45, lon: 30.52 }]])
  })
})
