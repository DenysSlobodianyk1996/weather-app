export interface WeatherList {
  dt: number
  main: Main
  weather: Weather[]
  wind: Wind
  dt_txt: string
  visibility: number
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

export interface Wind {
  speed: number
  deg: number
  gust: number
}

export interface ForecastModel {
  list: WeatherList[]
  timezoneOffset: number // Shift from UTC in seconds (OpenWeatherMap `city.timezone`)
}
