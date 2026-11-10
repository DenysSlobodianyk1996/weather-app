import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import WeatherTabs from './WeatherTabs.vue'
import type { WeatherTabMode } from '../models'

function mountTabs(props: { modelValue?: WeatherTabMode; mainCount?: number; favoriteCount?: number } = {}, slots = {}) {
  return mount(WeatherTabs, {
    props: { modelValue: 'main', mainCount: 2, favoriteCount: 3, ...props },
    slots,
    global: { plugins: [i18n] },
  })
}

describe('WeatherTabs', () => {
  it('shows Main and Favorites tabs, each with a count badge', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs).toHaveLength(2)
    expect(tabs[0].text()).toContain('Main')
    expect(tabs[0].find('.tabs__badge').text()).toBe('2')
    expect(tabs[1].text()).toContain('Favorites')
    expect(tabs[1].find('.tabs__badge').text()).toBe('3')
  })

  it('marks only the current tab as selected', () => {
    const wrapper = mountTabs({ modelValue: 'favorite' })
    const [main, favorite] = wrapper.findAll('[role="tab"]')

    expect(main.attributes('aria-selected')).toBe('false')
    expect(favorite.attributes('aria-selected')).toBe('true')
    expect(favorite.attributes('tabindex')).toBe('0')
    expect(main.attributes('tabindex')).toBe('-1')
  })

  it('selects a tab on click', async () => {
    const wrapper = mountTabs()

    await wrapper.findAll('[role="tab"]')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['favorite']])
  })

  it('moves between tabs with the arrow keys', async () => {
    const wrapper = mountTabs()

    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowRight' })
    await wrapper.setProps({ modelValue: 'favorite' })
    await wrapper.findAll('[role="tab"]')[1].trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['favorite'], ['main']])
  })

  it('renders the actions slot inside the tab bar', () => {
    const wrapper = mountTabs({}, { actions: '<button>Add city</button>' })

    expect(wrapper.find('.tabs').text()).toContain('Add city')
  })
})
