import type { WeatherList } from '@/models'

/**
 * Forecast shaping: turns the raw 3-hour forecast into what the City card shows, in the Location's local time.
 *
 * Pure: no Vue, no browser time zone. A "local timestamp" is a UTC timestamp shifted by the Location's offset,
 * so its UTC fields (`getUTCHours`, Intl with `timeZone: 'UTC'`) read as the Location's wall clock.
 */

export const DAY_PERIODS = ['night', 'morning', 'day', 'evening'] as const
export type DayPeriodName = typeof DAY_PERIODS[number]

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const SLOT_MS = 3 * HOUR_MS
const DAY_PERIOD_HOURS = 24 / DAY_PERIODS.length
const SLOTS_PER_DAY = DAY_MS / SLOT_MS

/** One 3-hour step of the forecast, with its start in the Location's local time. */
export interface ForecastSlot extends WeatherList {
  /** Slot start as a local timestamp (ms). */
  localTimestamp: number
  /** `YYYY-MM-DD`, local. */
  localDate: string
  /** `HH:mm`, local. */
  localTime: string
}

/** One table column: a slot start time of the local day, and the slot if the forecast still has it. */
export interface DayPeriodColumn {
  localTime: string
  /** Null when that time is already past (the forecast starts at the next slot) or beyond the forecast. */
  slot: ForecastSlot | null
}

/** A quarter of the local day. Always has the two slot start times that fall in it. */
export interface DayPeriod {
  name: DayPeriodName
  columns: DayPeriodColumn[]
}

export interface ForecastDay {
  localDate: string
  /** The day's Forecast slots that are in the forecast, in time order. */
  slots: ForecastSlot[]
  periods: DayPeriod[]
}

export interface CurrentConditions {
  /** The Forecast slot nearest now. */
  slot: ForecastSlot
  /** Now, as a local timestamp. */
  localTimestamp: number
}

export interface ShapedForecast {
  /** Every Forecast slot, in time order. */
  slots: ForecastSlot[]
  /** The Location's current local date, even when no slot of it is left. */
  today: ForecastDay
  /** Each local date that has slots, in order. */
  days: ForecastDay[]
  current: CurrentConditions | null
}

/**
 * @param list The raw forecast items.
 * @param timezoneOffset The Location's shift from UTC, in seconds (OpenWeatherMap `city.timezone`).
 * @param now Current time, ms since epoch.
 */
export function shapeForecast(list: WeatherList[], timezoneOffset: number, now: number): ShapedForecast {
  const offsetMs = timezoneOffset * 1000
  const slots = list
    .map(item => toForecastSlot(item, offsetMs))
    .sort((a, b) => a.localTimestamp - b.localTimestamp)

  // Slots sit on a 3-hour grid. Its phase in local time places the columns of a day that has no slots left.
  const gridPhase = positiveModulo(slots[0]?.localTimestamp ?? offsetMs, SLOT_MS)

  const slotsByDate = new Map<string, ForecastSlot[]>()
  slots.forEach(slot => {
    const daySlots = slotsByDate.get(slot.localDate) ?? []
    daySlots.push(slot)
    slotsByDate.set(slot.localDate, daySlots)
  })
  const toDay = (localDate: string) => buildDay(localDate, slotsByDate.get(localDate) ?? [], gridPhase)

  const days = [...slotsByDate.keys()].map(toDay)
  const todayDate = isoDate(now + offsetMs)

  return {
    slots,
    today: days.find(day => day.localDate === todayDate) ?? toDay(todayDate),
    days,
    current: currentConditions(slots, now, offsetMs),
  }
}

function toForecastSlot(item: WeatherList, offsetMs: number): ForecastSlot {
  const localTimestamp = item.dt * 1000 + offsetMs
  return {
    ...item,
    localTimestamp,
    localDate: isoDate(localTimestamp),
    localTime: formatLocalTime(localTimestamp),
  }
}

function buildDay(localDate: string, slots: ForecastSlot[], gridPhase: number): ForecastDay {
  const dayStart = Date.parse(`${localDate}T00:00:00Z`)
  const periods: DayPeriod[] = DAY_PERIODS.map(name => ({ name, columns: [] }))

  for(let index = 0; index < SLOTS_PER_DAY; index++) {
    const start = dayStart + gridPhase + index * SLOT_MS
    const hour = new Date(start).getUTCHours()
    periods[Math.floor(hour / DAY_PERIOD_HOURS)].columns.push({
      localTime: formatLocalTime(start),
      slot: slots.find(slot => slot.localTimestamp === start) ?? null,
    })
  }

  return { localDate, slots, periods }
}

function currentConditions(slots: ForecastSlot[], now: number, offsetMs: number): CurrentConditions | null {
  if(!slots.length) {
    return null
  }
  const distance = (slot: ForecastSlot) => Math.abs(slot.dt * 1000 - now)
  const slot = slots.reduce((nearest, candidate) => distance(candidate) < distance(nearest) ? candidate : nearest)
  return { slot, localTimestamp: now + offsetMs }
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor
}

function isoDate(localTimestamp: number) {
  return new Date(localTimestamp).toISOString().slice(0, 10)
}

const pad = (value: number) => String(value).padStart(2, '0')

/** `HH:mm` of a local timestamp. */
export function formatLocalTime(localTimestamp: number): string {
  const date = new Date(localTimestamp)
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

/** Short weekday, day and month of a local timestamp in the given language, e.g. "Tue, Nov 11" / "вт, 11 лист.". */
export function formatLocalDate(localTimestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(localTimestamp)
}

export const COMPASS_POINTS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const
export type CompassPoint = typeof COMPASS_POINTS[number]

/** The nearest of the 8 compass points for a wind direction in degrees (where the wind blows from). */
export function compassPoint(deg: number): CompassPoint {
  return COMPASS_POINTS[positiveModulo(Math.round(deg / 45), COMPASS_POINTS.length)]
}

/** Whole degrees, e.g. "7°", "0°", "−3°". */
export function formatTemperature(celsius: number): string {
  const rounded = Math.round(celsius)
  return `${rounded < 0 ? '−' : ''}${Math.abs(rounded)}°`
}
