import type { WeatherList } from '@/models'

export const utc = (iso: string) => Date.parse(`${iso}Z`)

/** One raw 3-hour item as the forecast service returns it. Its dt_txt fields are UTC, like the API's. */
export function forecastItem(isoUtc: string, temp = 5, extra: Partial<WeatherList> = {}): WeatherList {
  const [day, time] = isoUtc.split('T')
  return {
    dt: utc(isoUtc) / 1000,
    dt_txt: `${day} ${time}`,
    dt_txt_day: day,
    dt_txt_time: time,
    main: { temp, feels_like: temp - 2, temp_min: temp, temp_max: temp, pressure: 1012, humidity: 80 },
    weather: [{ id: 804, main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
    wind: { speed: 3.2, deg: 225, gust: 4 },
    visibility: 10000,
    ...extra,
  }
}

/** `count` items, 3 hours apart, from `fromUtc`; item n has temperature n. */
export function forecastItems(fromUtc: string, count: number): WeatherList[] {
  const start = utc(fromUtc)
  return Array.from({ length: count }, (_, index) =>
    forecastItem(new Date(start + index * 3 * 3600 * 1000).toISOString().slice(0, 19), index))
}
