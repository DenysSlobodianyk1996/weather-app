import { describe, expect, it } from 'vitest'
import {
  compassPoint,
  formatLocalDate,
  formatLocalTime,
  formatTemperature,
  shapeForecast,
  type ForecastDay,
} from './forecast'
import { forecastItem, forecastItems, utc } from './test-support/forecast-items'

const KYIV_WINTER = 2 * 3600
const KYIV_SUMMER = 3 * 3600
const NEW_YORK_WINTER = -5 * 3600
const DELHI = 5.5 * 3600

const columnTimes = (day: ForecastDay) => day.periods.flatMap(period => period.columns.map(column => column.localTime))
const filledTimes = (day: ForecastDay) =>
  day.periods.flatMap(period => period.columns.filter(column => column.slot).map(column => column.localTime))

describe('shapeForecast', () => {
  describe('a city ahead of UTC (Kyiv, +2 h)', () => {
    const list = forecastItems('2025-11-10T12:00:00', 16)
    const forecast = shapeForecast(list, KYIV_WINTER, utc('2025-11-10T12:20:00'))

    it('gives every Forecast slot its local date and time', () => {
      expect(forecast.slots[0]).toMatchObject({ localDate: '2025-11-10', localTime: '14:00', main: { temp: 0 } })
      expect(forecast.slots.at(-1)).toMatchObject({ localDate: '2025-11-12', localTime: '11:00' })
    })

    it("takes today from the city's local date", () => {
      expect(forecast.today.localDate).toBe('2025-11-10')
      expect(forecast.today.slots.map(slot => slot.localTime)).toEqual(['14:00', '17:00', '20:00', '23:00'])
    })

    it('groups today into Day periods with the real local times as columns', () => {
      expect(forecast.today.periods.map(period => period.name)).toEqual(['night', 'morning', 'day', 'evening'])
      expect(columnTimes(forecast.today))
        .toEqual(['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
    })

    it('leaves the columns that are already past without a slot', () => {
      expect(filledTimes(forecast.today)).toEqual(['14:00', '17:00', '20:00', '23:00'])
      const [night, morning, day, evening] = forecast.today.periods
      expect(night.columns.every(column => column.slot === null)).toBe(true)
      expect(morning.columns.every(column => column.slot === null)).toBe(true)
      expect(day.columns.map(column => column.slot?.main.temp)).toEqual([0, 1])
      expect(evening.columns.map(column => column.slot?.main.temp)).toEqual([2, 3])
    })

    it('lists each local day once, in order', () => {
      expect(forecast.days.map(day => day.localDate)).toEqual(['2025-11-10', '2025-11-11', '2025-11-12'])
      expect(forecast.days[1].slots).toHaveLength(8)
      expect(filledTimes(forecast.days[1])).toHaveLength(8)
    })

    it('takes the current conditions from the slot nearest now, with the local date and time of now', () => {
      expect(forecast.current?.slot.localTime).toBe('14:00')
      expect(formatLocalTime(forecast.current!.localTimestamp)).toBe('14:20')
      expect(formatLocalDate(forecast.current!.localTimestamp, 'en')).toBe('Mon, Nov 10')
    })
  })

  describe('a day split at local midnight (Kyiv, +3 h)', () => {
    const list = forecastItems('2025-06-10T15:00:00', 4) // 18:00, 21:00, 00:00 and 03:00 local

    it('puts a slot that is still yesterday in UTC into the next local day', () => {
      const forecast = shapeForecast(list, KYIV_SUMMER, utc('2025-06-10T15:00:00'))

      expect(forecast.today.localDate).toBe('2025-06-10')
      expect(forecast.today.slots.map(slot => slot.localTime)).toEqual(['18:00', '21:00'])
      expect(forecast.days[1].localDate).toBe('2025-06-11')
      expect(forecast.days[1].periods[0].columns.map(column => column.slot?.localTime)).toEqual(['00:00', '03:00'])
    })

    it('moves "today" to the new local date after local midnight, while UTC is still on the old one', () => {
      const forecast = shapeForecast(list, KYIV_SUMMER, utc('2025-06-10T21:30:00'))

      expect(forecast.today.localDate).toBe('2025-06-11')
      expect(filledTimes(forecast.today)).toEqual(['00:00', '03:00'])
      expect(forecast.current?.slot.localTime).toBe('00:00')
    })
  })

  describe('a city behind UTC (New York, −5 h)', () => {
    const list = forecastItems('2025-11-10T00:00:00', 6) // 19:00 and 22:00 on the 9th, then 01:00… on the 10th
    const forecast = shapeForecast(list, NEW_YORK_WINTER, utc('2025-11-10T01:00:00'))

    it('keeps "today" on the earlier local date', () => {
      expect(forecast.today.localDate).toBe('2025-11-09')
      expect(columnTimes(forecast.today))
        .toEqual(['01:00', '04:00', '07:00', '10:00', '13:00', '16:00', '19:00', '22:00'])
      expect(filledTimes(forecast.today)).toEqual(['19:00', '22:00'])
      expect(forecast.today.periods[3].columns.map(column => column.slot?.main.temp)).toEqual([0, 1])
    })

    it('starts the next local day at local midnight', () => {
      expect(forecast.days[1]).toMatchObject({ localDate: '2025-11-10' })
      expect(filledTimes(forecast.days[1])).toEqual(['01:00', '04:00', '07:00', '10:00'])
    })
  })

  it('handles an offset that is not a whole hour (Delhi, +5:30)', () => {
    const forecast = shapeForecast(forecastItems('2025-11-10T00:00:00', 8), DELHI, utc('2025-11-10T00:00:00'))

    expect(columnTimes(forecast.today))
      .toEqual(['02:30', '05:30', '08:30', '11:30', '14:30', '17:30', '20:30', '23:30'])
    expect(forecast.today.periods.map(period => period.columns.map(column => column.localTime)))
      .toEqual([['02:30', '05:30'], ['08:30', '11:30'], ['14:30', '17:30'], ['20:30', '23:30']])
    expect(filledTimes(forecast.today)).toEqual(['05:30', '08:30', '11:30', '14:30', '17:30', '20:30', '23:30'])
  })

  it('keeps 0 values (0 °C, 0 % humidity, 0 m visibility)', () => {
    const zero = forecastItem('2025-01-15T12:00:00', 0, {
      main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, pressure: 1000, humidity: 0 },
      visibility: 0,
      wind: { speed: 0, deg: 0, gust: 0 },
    })
    const forecast = shapeForecast([zero], KYIV_WINTER, utc('2025-01-15T12:00:00'))

    expect(forecast.current?.slot).toMatchObject({
      main: { temp: 0, feels_like: 0, humidity: 0 },
      visibility: 0,
      wind: { speed: 0, deg: 0 },
    })
    expect(forecast.today.periods[2].columns[0].slot).toMatchObject({ localTime: '14:00', main: { temp: 0 } })
  })

  it('still lays out today from the offset when the forecast is empty', () => {
    const forecast = shapeForecast([], KYIV_WINTER, utc('2025-11-10T12:00:00'))

    expect(forecast.current).toBeNull()
    expect(forecast.slots).toEqual([])
    expect(forecast.days).toEqual([])
    expect(forecast.today.localDate).toBe('2025-11-10')
    expect(columnTimes(forecast.today))
      .toEqual(['02:00', '05:00', '08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
    expect(filledTimes(forecast.today)).toEqual([])
  })
})

describe('formatLocalDate', () => {
  const tuesday = utc('2025-11-11T23:30:00')

  it('formats the shifted timestamp as-is, whatever the browser time zone', () => {
    expect(formatLocalDate(tuesday, 'en')).toBe('Tue, Nov 11')
  })

  it('uses the current language', () => {
    expect(formatLocalDate(tuesday, 'uk')).toBe('вт, 11 лист.')
  })
})

describe('formatLocalTime', () => {
  it('gives 24-hour local time', () => {
    expect(formatLocalTime(utc('2025-11-11T00:05:00'))).toBe('00:05')
    expect(formatLocalTime(utc('2025-11-11T23:59:00'))).toBe('23:59')
  })
})

describe('compassPoint', () => {
  it.each([
    [0, 'n'], [22, 'n'], [23, 'ne'], [45, 'ne'], [90, 'e'], [135, 'se'],
    [180, 's'], [225, 'sw'], [270, 'w'], [315, 'nw'], [338, 'n'], [360, 'n'],
  ] as const)('%i° is %s', (deg, point) => {
    expect(compassPoint(deg)).toBe(point)
  })
})

describe('formatTemperature', () => {
  it.each([
    [7.4, '7°'], [0, '0°'], [-0.4, '0°'], [-3.6, '−4°'], [12.5, '13°'],
  ])('%d °C is %s', (celsius, text) => {
    expect(formatTemperature(celsius)).toBe(text)
  })
})
