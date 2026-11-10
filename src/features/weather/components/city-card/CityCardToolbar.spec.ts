import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { GeoapifyApiService } from '@/services'
import CityCardToolbar from './CityCardToolbar.vue'

type ToolbarProps = {
  hasLocation?: boolean
  isFavorite?: boolean
  hideRemoveAction?: boolean
}

function mountToolbar(props: ToolbarProps = {}) {
  return mount(CityCardToolbar, {
    props: { hasLocation: true, isFavorite: false, ...props },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
}

const byLabel = (label: string) => `button[aria-label="${label}"]`

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

  it('asks for removal only after the delete is confirmed', async () => {
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Delete card')).trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
    expect(wrapper.emitted('remove')).toBeUndefined()

    const confirm = wrapper.findAll('dialog button').find(button => button.text() === 'Confirm')!
    await confirm.trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('selects the IP Location when "Use my location" is clicked', async () => {
    vi.spyOn(GeoapifyApiService, 'getIpLocation').mockResolvedValue({ ok: true, data: { lat: 50.45, lon: 30.52 } })
    const wrapper = mountToolbar()

    await wrapper.find(byLabel('Use my location')).trigger('click')
    await flushPromises()

    expect(wrapper.emitted('select')).toEqual([[{ lat: 50.45, lon: 30.52 }]])
  })
})
