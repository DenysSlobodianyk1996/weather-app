import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { shapeForecast } from '../../forecast'
import { forecastItem, utc } from '../../test-support/forecast-items'
import FiveDayForecast from './FiveDayForecast.vue'

const rain = [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }]

// Kyiv (+2), now 12:20 UTC on Mon 10 Nov: today keeps 14:00 and 17:00 local; Tue 11 has three slots.
const { fiveDays } = shapeForecast([
  forecastItem('2025-11-10T12:00:00', 4.6),
  forecastItem('2025-11-10T15:00:00', 1.4),
  forecastItem('2025-11-11T07:00:00', -3),
  forecastItem('2025-11-11T10:00:00', 0, { weather: rain }),
  forecastItem('2025-11-11T13:00:00', 0.6),
], 7200, utc('2025-11-10T12:20:00'))

function mountRows() {
  return mount(FiveDayForecast, { props: { days: fiveDays }, global: { plugins: [i18n] } })
}

const rowTexts = (wrapper: ReturnType<typeof mountRows>, selector: string) =>
  wrapper.findAll('li').map(row => row.find(selector).text())

describe('FiveDayForecast', () => {
  afterEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('shows one row per day with a localised day label', () => {
    const wrapper = mountRows()

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(rowTexts(wrapper, '.five-day-forecast__day')).toEqual(['Today Nov 10', 'Tue Nov 11'])
  })

  it('shows the Daily average large, and the low and high as text', () => {
    const wrapper = mountRows()

    expect(rowTexts(wrapper, '.five-day-forecast__average')).toEqual(['3°', '−1°'])
    expect(rowTexts(wrapper, '.five-day-forecast__range')).toEqual(['Low ↓ 1° high ↑ 5°', 'Low ↓ −3° high ↑ 1°'])
  })

  it('shows the icon and description of the slot nearest local midday', () => {
    const wrapper = mountRows()
    const tuesday = wrapper.findAll('li')[1]

    expect(tuesday.find('.five-day-forecast__description').text()).toBe('light rain')
    expect(tuesday.find('svg[aria-label="light rain"]').exists()).toBe(true)
    expect(tuesday.find('svg').attributes('width')).toBe('32')
  })

  it('has nothing to click into', () => {
    expect(mountRows().find('button, a').exists()).toBe(false)
  })

  it('labels days in the current language', async () => {
    const wrapper = mountRows()
    i18n.global.locale.value = 'uk'
    await wrapper.vm.$nextTick()

    expect(rowTexts(wrapper, '.five-day-forecast__day')).toEqual(['Сьогодні 10 лист.', 'вт 11 лист.'])
    expect(wrapper.findAll('li')[0].find('.five-day-forecast__range').text()).toBe('Мінімум ↓ 1° максимум ↑ 5°')
  })
})
