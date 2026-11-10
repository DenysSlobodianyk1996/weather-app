/*
 * Our own weather icons, from the "Weather icons" artboard in
 * docs/design/project/Icons.dc.html. One icon per OpenWeatherMap icon code;
 * only 01 (clear), 02 (few clouds) and 10 (rain) differ between day and night.
 */

export type WeatherIconName =
  | 'clear-day'
  | 'clear-night'
  | 'few-clouds-day'
  | 'few-clouds-night'
  | 'scattered-clouds'
  | 'broken-clouds'
  | 'shower-rain'
  | 'rain-day'
  | 'rain-night'
  | 'thunderstorm'
  | 'snow'
  | 'mist'

const ICON_BY_CODE: Record<string, WeatherIconName> = {
  '01d': 'clear-day',
  '01n': 'clear-night',
  '02d': 'few-clouds-day',
  '02n': 'few-clouds-night',
  '03d': 'scattered-clouds',
  '03n': 'scattered-clouds',
  '04d': 'broken-clouds',
  '04n': 'broken-clouds',
  '09d': 'shower-rain',
  '09n': 'shower-rain',
  '10d': 'rain-day',
  '10n': 'rain-night',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'mist',
  '50n': 'mist',
}

/** The 18 OpenWeatherMap icon codes we have artwork for. */
export const WEATHER_ICON_CODES: readonly string[] = Object.keys(ICON_BY_CODE)

const FALLBACK_CODE = '03d'

/** The icon for an OpenWeatherMap icon code, used as-is. Unknown codes get the 03d icon. */
export function weatherIconName(code: string): WeatherIconName {
  return Object.hasOwn(ICON_BY_CODE, code) ? ICON_BY_CODE[code] : ICON_BY_CODE[FALLBACK_CODE]
}

/** Theme colours the artwork uses, all tokens from src/style.css. */
export type WeatherIconColor =
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'cloud-dark'
  | 'outline'
  | 'rain'
  | 'snow'

export const WEATHER_ICON_COLOR_TOKENS: Record<WeatherIconColor, string> = {
  sun: '--color-sun',
  moon: '--color-accent-soft',
  cloud: '--color-surface-muted',
  'cloud-dark': '--color-border',
  outline: '--color-text-muted',
  rain: '--color-accent',
  snow: '--color-snow',
}

export interface WeatherIconShape {
  tag: 'path' | 'circle'
  /** Geometry: `d` for a path, `cx`/`cy`/`r` for a circle. */
  attrs: Record<string, string | number>
  fill?: WeatherIconColor
  stroke?: WeatherIconColor
  /** Stroke width at 64 px; thicker at small sizes. */
  strokeWidth?: number
  /** Rounded line ends, for rays, drops and lines. */
  roundCaps?: boolean
}

// Shapes shared by several icons, in the 64×64 viewBox.
const outlined = (fill: WeatherIconColor, d: string, strokeWidth = 2.5): WeatherIconShape => ({
  tag: 'path',
  attrs: { d },
  fill,
  stroke: 'outline',
  strokeWidth,
})
const lines = (stroke: WeatherIconColor, d: string, strokeWidth: number): WeatherIconShape => ({
  tag: 'path',
  attrs: { d },
  stroke,
  strokeWidth,
  roundCaps: true,
})
const sun = (cx: number, cy: number, r: number): WeatherIconShape => ({ tag: 'circle', attrs: { cx, cy, r }, fill: 'sun' })

const BIG_CLOUD = 'M18 48h30a10 10 0 0 0 0-20 14 14 0 0 0-26.8 4.4A8 8 0 0 0 18 48z'
const RAIN_CLOUD = 'M18 40h30a10 10 0 0 0 0-20 14 14 0 0 0-26.8 4.4A8 8 0 0 0 18 40z'
const LOW_CLOUD = 'M22 52h26a9 9 0 0 0 0-18 12 12 0 0 0-23 3.8A7 7 0 0 0 22 52z'
const MID_CLOUD = 'M20 44h28a9 9 0 0 0 0-18 12 12 0 0 0-23 3.8A7 7 0 0 0 20 44z'
const RAIN_DROPS = 'M26 50l-2.5 6M35 50l-2.5 6M44 50l-2.5 6'

export const WEATHER_ICON_ART: Record<WeatherIconName, readonly WeatherIconShape[]> = {
  'clear-day': [
    lines('sun', 'M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4.2 4.2M44.8 44.8L49 49M15 49l4.2-4.2M44.8 19.2L49 15', 3),
    sun(32, 32, 11),
  ],
  'clear-night': [outlined('moon', 'M38 12a20 20 0 1 0 14 32A17 17 0 0 1 38 12z')],
  'few-clouds-day': [sun(24, 22, 10), outlined('cloud', LOW_CLOUD)],
  'few-clouds-night': [outlined('moon', 'M26 10a12 12 0 1 0 9 19A10 10 0 0 1 26 10z'), outlined('cloud', LOW_CLOUD)],
  'scattered-clouds': [outlined('cloud', BIG_CLOUD)],
  'broken-clouds': [
    outlined('cloud-dark', 'M26 34h24a8 8 0 0 0 0-16 11 11 0 0 0-21 3.4A6.5 6.5 0 0 0 26 34z'),
    outlined('cloud', 'M14 52h28a9 9 0 0 0 0-18 13 13 0 0 0-25 4A7.5 7.5 0 0 0 14 52z'),
  ],
  'shower-rain': [outlined('cloud-dark', RAIN_CLOUD), lines('rain', 'M20 46l-3 7M28 46l-3 7M36 46l-3 7M44 46l-3 7', 2.5)],
  'rain-day': [sun(24, 18, 9), outlined('cloud', MID_CLOUD), lines('rain', RAIN_DROPS, 2.5)],
  'rain-night': [
    outlined('moon', 'M26 7a11 11 0 1 0 8.5 17.5A9 9 0 0 1 26 7z'),
    outlined('cloud', MID_CLOUD),
    lines('rain', RAIN_DROPS, 2.5),
  ],
  thunderstorm: [outlined('cloud-dark', RAIN_CLOUD), outlined('sun', 'M34 40l-7 11h7l-4 9 11-14h-7l4-6z', 2)],
  snow: [
    outlined('cloud', RAIN_CLOUD),
    lines('snow', 'M22 47v8M18.5 49l7 4M18.5 53l7-4M42 47v8M38.5 49l7 4M38.5 53l7-4M32 52v8M28.5 54l7 4M28.5 58l7-4', 2.2),
  ],
  mist: [lines('outline', 'M12 22h30M20 32h32M12 42h34M24 52h22', 3)],
}

/**
 * Extra stroke width at small sizes so outlines stay visible
 * (artboard: 2.5 at 64 px, 3 at 32 px, 3.5 at 28 px).
 */
export function strokeBoost(size: number): number {
  if (size <= 28) return 1
  if (size <= 32) return 0.5
  return 0
}
