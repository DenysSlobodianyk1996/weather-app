import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { shapeForecast } from '../../forecast'
import { forecastItem, utc } from '../../test-support/forecast-items'
import CurrentConditions from './CurrentConditions.vue'

function mountConditions(temp: number) {
  const { current } = shapeForecast([forecastItem('2025-11-10T12:00:00', temp)], 7200, utc('2025-11-10T12:20:00'))
  return mount(CurrentConditions, {
    props: { current: current! },
    slots: { default: '<h2>Kyiv, Ukraine</h2>' },
    global: { plugins: [i18n] },
  })
}

describe('CurrentConditions', () => {
  afterEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('shows temperature, icon, description, feels like and the local date and time', () => {
    const wrapper = mountConditions(6.3)

    expect(wrapper.find('.current-conditions__temperature').text()).toBe('6°')
    expect(wrapper.find('svg[aria-label="overcast clouds"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kyiv, Ukraine')
    expect(wrapper.text()).toContain('overcast clouds · Feels like 4°')
    expect(wrapper.text()).toContain('Mon, Nov 10 · 14:20 local time')
  })

  it('shows 0 °C', () => {
    expect(mountConditions(0).find('.current-conditions__temperature').text()).toBe('0°')
  })

  it('formats the date in the current language', async () => {
    const wrapper = mountConditions(6)
    i18n.global.locale.value = 'uk'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('пн, 10 лист. · 14:20 за місцевим часом')
    expect(wrapper.text()).toContain('Відчувається як 4°')
  })
})
