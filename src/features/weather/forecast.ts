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
/** Local days in the 5-day view, today included. */
const FIVE_DAYS = 5
const MIDDAY_MS = 12 * HOUR_MS

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

/** One row of the 5-day view: a local day summed up by its Forecast slots that are still in the forecast. */
export interface DailyForecast {
  localDate: string
  /** Local midnight that starts the day, as a local timestamp (ms). */
  localTimestamp: number
  isToday: boolean
  /** Mean of the day's slot temperatures, °C. */
  dailyAverage: number
  /** Lowest slot temperature, °C. */
  low: number
  /** Highest slot temperature, °C. */
  high: number
  /** The slot nearest local midday; its weather gives the day's icon and description. */
  middaySlot: ForecastSlot
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
  /** Today and the next 4 local days, leaving out any that has no slots. */
  fiveDays: DailyForecast[]
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
  const lastDate = isoDate(Date.parse(`${todayDate}T00:00:00Z`) + (FIVE_DAYS - 1) * DAY_MS)

  return {
    slots,
    today: days.find(day => day.localDate === todayDate) ?? toDay(todayDate),
    days,
    fiveDays: days
      .filter(day => day.localDate >= todayDate && day.localDate <= lastDate)
      .map(day => dailyForecast(day, todayDate)),
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

/** @param day A day with at least one slot. */
function dailyForecast({ localDate, slots }: ForecastDay, todayDate: string): DailyForecast {
  const localTimestamp = Date.parse(`${localDate}T00:00:00Z`)
  const temperatures = slots.map(slot => slot.main.temp)
  const fromMidday = (slot: ForecastSlot) => Math.abs(slot.localTimestamp - (localTimestamp + MIDDAY_MS))

  return {
    localDate,
    localTimestamp,
    isToday: localDate === todayDate,
    dailyAverage: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length,
    low: Math.min(...temperatures),
    high: Math.max(...temperatures),
    // On a tie the earlier slot wins.
    middaySlot: slots.reduce((nearest, candidate) => fromMidday(candidate) < fromMidday(nearest) ? candidate : nearest),
  }
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

/** Short weekday of a local timestamp in the given language, e.g. "Wed" / "ср". */
export function formatWeekday(localTimestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(localTimestamp)
}

/** Day and short month of a local timestamp in the given language, e.g. "Nov 12" / "12 лист.". */
export function formatDayMonth(localTimestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(localTimestamp)
}

/** Short weekday and day of month of a local timestamp, e.g. "Wed 12" / "ср 12". */
export function formatShortDay(localTimestamp: number, locale: string): string {
  return `${formatWeekday(localTimestamp, locale)} ${new Date(localTimestamp).getUTCDate()}`
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
