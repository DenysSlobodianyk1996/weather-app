import { describe, expect, it } from 'vitest'
import { WEATHER_ICON_CODES, weatherIconName } from './weather-icons'

describe('weatherIconName', () => {
  it.each([
    ['01d', 'clear-day'],
    ['01n', 'clear-night'],
    ['02d', 'few-clouds-day'],
    ['02n', 'few-clouds-night'],
    ['03d', 'scattered-clouds'],
    ['03n', 'scattered-clouds'],
    ['04d', 'broken-clouds'],
    ['04n', 'broken-clouds'],
    ['09d', 'shower-rain'],
    ['09n', 'shower-rain'],
    ['10d', 'rain-day'],
    ['10n', 'rain-night'],
    ['11d', 'thunderstorm'],
    ['11n', 'thunderstorm'],
    ['13d', 'snow'],
    ['13n', 'snow'],
    ['50d', 'mist'],
    ['50n', 'mist'],
  ])('maps %s to the %s icon', (code, name) => {
    expect(weatherIconName(code)).toBe(name)
  })

  it('knows all 18 OpenWeatherMap codes', () => {
    expect(WEATHER_ICON_CODES).toHaveLength(18)
  })

  it('only differs between day and night for 01, 02 and 10', () => {
    const groups = ['01', '02', '03', '04', '09', '10', '11', '13', '50']
    const differing = groups.filter((group) => weatherIconName(`${group}d`) !== weatherIconName(`${group}n`))

    expect(differing).toEqual(['01', '02', '10'])
  })

  it.each(['', '05d', '10x', '10D', ' 10d', 'rain', '1d'])('falls back to the 03d icon for the unknown code %j', (code) => {
    expect(weatherIconName(code)).toBe(weatherIconName('03d'))
  })
})
