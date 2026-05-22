export interface WeatherList {
  dt: number
  main: Main
  weather: Weather[]
  clouds: Clouds
  wind: Wind
  rain?: Rain
  dt_txt: string
  visibility: number
  dt_txt_day?: string // mapped on FE
  dt_txt_time?: string // mapped on FE
}

export interface Main {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface Weather {
  id: number
  main: string
  description: string
  icon: string
}

export interface Clouds {
  all: number
}

export interface Wind {
  speed: number
  deg: number
  gust: number
}

export type Rain = Record<string, number>
