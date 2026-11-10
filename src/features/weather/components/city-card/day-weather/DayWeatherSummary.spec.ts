import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import { shapeForecast } from '../../../forecast'
import { forecastItem, forecastItems, utc } from '../../../test-support/forecast-items'
import DayWeatherSummary from './DayWeatherSummary.vue'

const KYIV = 7200

function mountTable(periods: ReturnType<typeof shapeForecast>['today']['periods']) {
  return mount(DayWeatherSummary, { props: { periods }, global: { plugins: [i18n] } })
}

const row = (wrapper: ReturnType<typeof mountTable>, label: string) =>
  wrapper.findAll('tbody tr').find(tr => tr.find('th').text() === label)!
const cells = (wrapper: ReturnType<typeof mountTable>, label: string) =>
  row(wrapper, label).findAll('td').map(td => td.text())

describe('DayWeatherSummary', () => {
  it("heads the columns with the Day periods and each slot's real local time", () => {
    const { today } = shapeForecast(forecastItems('2025-11-10T00:00:00', 8), KYIV, utc('2025-11-10T00:00:00'))
    const wrapper = mountTable(today.periods)

    expect(wrapper.findAll('thead th').map(th => th.text())).toEqual(['', 'Night', 'Morning', 'Day', 'Evening'])
    expect(cells(wrapper, 'Time')).toEqual(['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
    expect(cells(wrapper, 'Temperature')).toEqual(['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°'])
  })

  it('keeps the columns of slots already past, empty', () => {
    const { today } = shapeForecast(forecastItems('2025-11-10T12:00:00', 4), KYIV, utc('2025-11-10T12:00:00'))
    const wrapper = mountTable(today.periods)

    expect(cells(wrapper, 'Time')).toEqual(['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
    expect(cells(wrapper, 'Temperature')).toEqual(['', '', '', '', '0°', '1°', '2°', '3°'])
  })

  it('shows 0 values instead of hiding them', () => {
    const zero = forecastItem('2025-11-10T12:00:00', 0, {
      main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, pressure: 1000, humidity: 0 },
      visibility: 0,
      wind: { speed: 0, deg: 0, gust: 0 },
    })
    const { today } = shapeForecast([zero], KYIV, utc('2025-11-10T12:00:00'))
    const wrapper = mountTable(today.periods)
    const at14 = (label: string) => cells(wrapper, label)[4]

    expect(at14('Temperature')).toBe('0°')
    expect(at14('Feels like')).toBe('0°')
    expect(at14('Humidity')).toBe('0%')
    expect(at14('Visibility')).toBe('0 km')
    expect(at14('Wind')).toBe('N 0 m/s')
  })

  it('shows wind direction and speed, and the other readings with units', () => {
    const { today } = shapeForecast(
      [forecastItem('2025-11-10T12:00:00', 7.4, { visibility: 6500 })], KYIV, utc('2025-11-10T12:00:00'))
    const wrapper = mountTable(today.periods)
    const at14 = (label: string) => cells(wrapper, label)[4]

    expect(at14('Wind')).toBe('SW 3.2 m/s')
    expect(at14('Pressure')).toBe('1012 hPa')
    expect(at14('Visibility')).toBe('6.5 km')
    expect(at14('Feels like')).toBe('5°')
  })
})
