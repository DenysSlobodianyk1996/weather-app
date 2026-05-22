import type { ForcastRequestModel, WeatherList } from '@/models';
import axios from 'axios'

const openweathermapApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data',
  timeout: 2000,
});
openweathermapApi.interceptors.request.use(config => {
  if(!config.params) {
    config.params = {}
  }
  config.params.appid = import.meta.env.VITE_OPEN_WEATHER_KEY
  return config;
})

export const WeatherApiService = {
  get5Days3HoursForecast(request: ForcastRequestModel) {
    const url = '/2.5/forecast';
    const params = {
      ...request,
      units: 'metric'
    }

    const result = [
        {
            "dt": 1779386400,
            "main": {
                "temp": 20.67,
                "feels_like": 20.96,
                "temp_min": 18.2,
                "temp_max": 20.67,
                "pressure": 1015,
                "sea_level": 1015,
                "grnd_level": 995,
                "humidity": 83,
                "temp_kf": 2.47
            },
            "weather": [
                {
                    "id": 500,
                    "main": "Rain",
                    "description": "light rain",
                    "icon": "10n"
                }
            ],
            "clouds": {
                "all": 87
            },
            "wind": {
                "speed": 3.34,
                "deg": 40,
                "gust": 7.49
            },
            "visibility": 10000,
            "pop": 1,
            "rain": {
                "3h": 0.88
            },
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-21 18:00:00"
        },
        {
            "dt": 1779397200,
            "main": {
                "temp": 18.57,
                "feels_like": 18.78,
                "temp_min": 16.9,
                "temp_max": 18.57,
                "pressure": 1016,
                "sea_level": 1016,
                "grnd_level": 996,
                "humidity": 88,
                "temp_kf": 1.67
            },
            "weather": [
                {
                    "id": 500,
                    "main": "Rain",
                    "description": "light rain",
                    "icon": "10n"
                }
            ],
            "clouds": {
                "all": 94
            },
            "wind": {
                "speed": 1.56,
                "deg": 84,
                "gust": 1.61
            },
            "visibility": 10000,
            "pop": 1,
            "rain": {
                "3h": 1.27
            },
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-21 21:00:00"
        },
        {
            "dt": 1779408000,
            "main": {
                "temp": 16.12,
                "feels_like": 16.16,
                "temp_min": 16.12,
                "temp_max": 16.12,
                "pressure": 1017,
                "sea_level": 1017,
                "grnd_level": 996,
                "humidity": 91,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 94
            },
            "wind": {
                "speed": 2.82,
                "deg": 23,
                "gust": 2.82
            },
            "visibility": 10000,
            "pop": 0.79,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-22 00:00:00"
        },
        {
            "dt": 1779418800,
            "main": {
                "temp": 16.16,
                "feels_like": 16.23,
                "temp_min": 16.16,
                "temp_max": 16.16,
                "pressure": 1018,
                "sea_level": 1018,
                "grnd_level": 997,
                "humidity": 92,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 100
            },
            "wind": {
                "speed": 2.74,
                "deg": 36,
                "gust": 4.05
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-22 03:00:00"
        },
        {
            "dt": 1779429600,
            "main": {
                "temp": 21.61,
                "feels_like": 21.86,
                "temp_min": 21.61,
                "temp_max": 21.61,
                "pressure": 1019,
                "sea_level": 1019,
                "grnd_level": 998,
                "humidity": 78,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 86
            },
            "wind": {
                "speed": 2.97,
                "deg": 28,
                "gust": 4.03
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-22 06:00:00"
        },
        {
            "dt": 1779440400,
            "main": {
                "temp": 22.58,
                "feels_like": 22.83,
                "temp_min": 22.58,
                "temp_max": 22.58,
                "pressure": 1020,
                "sea_level": 1020,
                "grnd_level": 999,
                "humidity": 74,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 501,
                    "main": "Rain",
                    "description": "moderate rain",
                    "icon": "10d"
                }
            ],
            "clouds": {
                "all": 66
            },
            "wind": {
                "speed": 2.14,
                "deg": 59,
                "gust": 2.9
            },
            "visibility": 10000,
            "pop": 1,
            "rain": {
                "3h": 4.67
            },
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-22 09:00:00"
        },
        {
            "dt": 1779451200,
            "main": {
                "temp": 19.64,
                "feels_like": 19.83,
                "temp_min": 19.64,
                "temp_max": 19.64,
                "pressure": 1019,
                "sea_level": 1019,
                "grnd_level": 998,
                "humidity": 83,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 501,
                    "main": "Rain",
                    "description": "moderate rain",
                    "icon": "10d"
                }
            ],
            "clouds": {
                "all": 83
            },
            "wind": {
                "speed": 2.49,
                "deg": 27,
                "gust": 4.44
            },
            "visibility": 10000,
            "pop": 1,
            "rain": {
                "3h": 3.62
            },
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-22 12:00:00"
        },
        {
            "dt": 1779462000,
            "main": {
                "temp": 19.28,
                "feels_like": 19.2,
                "temp_min": 19.28,
                "temp_max": 19.28,
                "pressure": 1020,
                "sea_level": 1020,
                "grnd_level": 999,
                "humidity": 74,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 78
            },
            "wind": {
                "speed": 4.06,
                "deg": 340,
                "gust": 7.44
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-22 15:00:00"
        },
        {
            "dt": 1779472800,
            "main": {
                "temp": 15.71,
                "feels_like": 15.69,
                "temp_min": 15.71,
                "temp_max": 15.71,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1001,
                "humidity": 90,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 500,
                    "main": "Rain",
                    "description": "light rain",
                    "icon": "10n"
                }
            ],
            "clouds": {
                "all": 59
            },
            "wind": {
                "speed": 2.58,
                "deg": 20,
                "gust": 5.65
            },
            "visibility": 10000,
            "pop": 0.82,
            "rain": {
                "3h": 1.25
            },
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-22 18:00:00"
        },
        {
            "dt": 1779483600,
            "main": {
                "temp": 14.39,
                "feels_like": 14.37,
                "temp_min": 14.39,
                "temp_max": 14.39,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1000,
                "humidity": 95,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 100
            },
            "wind": {
                "speed": 3.8,
                "deg": 326,
                "gust": 7.94
            },
            "visibility": 10000,
            "pop": 0.09,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-22 21:00:00"
        },
        {
            "dt": 1779494400,
            "main": {
                "temp": 15.05,
                "feels_like": 15.09,
                "temp_min": 15.05,
                "temp_max": 15.05,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1000,
                "humidity": 95,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 500,
                    "main": "Rain",
                    "description": "light rain",
                    "icon": "10n"
                }
            ],
            "clouds": {
                "all": 100
            },
            "wind": {
                "speed": 5.17,
                "deg": 359,
                "gust": 11.47
            },
            "visibility": 10000,
            "pop": 0.91,
            "rain": {
                "3h": 0.76
            },
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-23 00:00:00"
        },
        {
            "dt": 1779505200,
            "main": {
                "temp": 13.1,
                "feels_like": 12.95,
                "temp_min": 13.1,
                "temp_max": 13.1,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1001,
                "humidity": 95,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 96
            },
            "wind": {
                "speed": 4.83,
                "deg": 344,
                "gust": 10.4
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-23 03:00:00"
        },
        {
            "dt": 1779516000,
            "main": {
                "temp": 16.37,
                "feels_like": 16.18,
                "temp_min": 16.37,
                "temp_max": 16.37,
                "pressure": 1024,
                "sea_level": 1024,
                "grnd_level": 1002,
                "humidity": 81,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 91
            },
            "wind": {
                "speed": 5.91,
                "deg": 9,
                "gust": 9.22
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-23 06:00:00"
        },
        {
            "dt": 1779526800,
            "main": {
                "temp": 20.01,
                "feels_like": 19.69,
                "temp_min": 20.01,
                "temp_max": 20.01,
                "pressure": 1024,
                "sea_level": 1024,
                "grnd_level": 1003,
                "humidity": 62,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 100
            },
            "wind": {
                "speed": 5.68,
                "deg": 13,
                "gust": 6.39
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-23 09:00:00"
        },
        {
            "dt": 1779537600,
            "main": {
                "temp": 21.53,
                "feels_like": 21.17,
                "temp_min": 21.53,
                "temp_max": 21.53,
                "pressure": 1023,
                "sea_level": 1023,
                "grnd_level": 1002,
                "humidity": 55,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 78
            },
            "wind": {
                "speed": 5.05,
                "deg": 4,
                "gust": 5.66
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-23 12:00:00"
        },
        {
            "dt": 1779548400,
            "main": {
                "temp": 20.75,
                "feels_like": 20.53,
                "temp_min": 20.75,
                "temp_max": 20.75,
                "pressure": 1023,
                "sea_level": 1023,
                "grnd_level": 1002,
                "humidity": 63,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 801,
                    "main": "Clouds",
                    "description": "few clouds",
                    "icon": "02d"
                }
            ],
            "clouds": {
                "all": 15
            },
            "wind": {
                "speed": 4.56,
                "deg": 353,
                "gust": 6.52
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-23 15:00:00"
        },
        {
            "dt": 1779559200,
            "main": {
                "temp": 15.07,
                "feels_like": 14.67,
                "temp_min": 15.07,
                "temp_max": 15.07,
                "pressure": 1023,
                "sea_level": 1023,
                "grnd_level": 1002,
                "humidity": 78,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01n"
                }
            ],
            "clouds": {
                "all": 7
            },
            "wind": {
                "speed": 3.67,
                "deg": 344,
                "gust": 7.29
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-23 18:00:00"
        },
        {
            "dt": 1779570000,
            "main": {
                "temp": 15.35,
                "feels_like": 14.77,
                "temp_min": 15.35,
                "temp_max": 15.35,
                "pressure": 1024,
                "sea_level": 1024,
                "grnd_level": 1003,
                "humidity": 70,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 56
            },
            "wind": {
                "speed": 2.29,
                "deg": 16,
                "gust": 3.61
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-23 21:00:00"
        },
        {
            "dt": 1779580800,
            "main": {
                "temp": 12.25,
                "feels_like": 11.75,
                "temp_min": 12.25,
                "temp_max": 12.25,
                "pressure": 1024,
                "sea_level": 1024,
                "grnd_level": 1003,
                "humidity": 85,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 60
            },
            "wind": {
                "speed": 3.32,
                "deg": 5,
                "gust": 5.71
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-24 00:00:00"
        },
        {
            "dt": 1779591600,
            "main": {
                "temp": 11.35,
                "feels_like": 10.89,
                "temp_min": 11.35,
                "temp_max": 11.35,
                "pressure": 1025,
                "sea_level": 1025,
                "grnd_level": 1003,
                "humidity": 90,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ],
            "clouds": {
                "all": 0
            },
            "wind": {
                "speed": 3.11,
                "deg": 341,
                "gust": 6.13
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-24 03:00:00"
        },
        {
            "dt": 1779602400,
            "main": {
                "temp": 17.08,
                "feels_like": 16.75,
                "temp_min": 17.08,
                "temp_max": 17.08,
                "pressure": 1025,
                "sea_level": 1025,
                "grnd_level": 1003,
                "humidity": 73,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ],
            "clouds": {
                "all": 1
            },
            "wind": {
                "speed": 4.15,
                "deg": 351,
                "gust": 5.98
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-24 06:00:00"
        },
        {
            "dt": 1779613200,
            "main": {
                "temp": 20.43,
                "feels_like": 20.07,
                "temp_min": 20.43,
                "temp_max": 20.43,
                "pressure": 1025,
                "sea_level": 1025,
                "grnd_level": 1003,
                "humidity": 59,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ],
            "clouds": {
                "all": 10
            },
            "wind": {
                "speed": 3.95,
                "deg": 357,
                "gust": 4.97
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-24 09:00:00"
        },
        {
            "dt": 1779624000,
            "main": {
                "temp": 20.42,
                "feels_like": 20.16,
                "temp_min": 20.42,
                "temp_max": 20.42,
                "pressure": 1023,
                "sea_level": 1023,
                "grnd_level": 1002,
                "humidity": 63,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d"
                }
            ],
            "clouds": {
                "all": 46
            },
            "wind": {
                "speed": 3.15,
                "deg": 320,
                "gust": 4.6
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-24 12:00:00"
        },
        {
            "dt": 1779634800,
            "main": {
                "temp": 18.88,
                "feels_like": 18.7,
                "temp_min": 18.88,
                "temp_max": 18.88,
                "pressure": 1023,
                "sea_level": 1023,
                "grnd_level": 1002,
                "humidity": 72,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 100
            },
            "wind": {
                "speed": 5.08,
                "deg": 333,
                "gust": 8.95
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-24 15:00:00"
        },
        {
            "dt": 1779645600,
            "main": {
                "temp": 15.5,
                "feels_like": 15.3,
                "temp_min": 15.5,
                "temp_max": 15.5,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1001,
                "humidity": 84,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 74
            },
            "wind": {
                "speed": 2.77,
                "deg": 307,
                "gust": 2.73
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-24 18:00:00"
        },
        {
            "dt": 1779656400,
            "main": {
                "temp": 16.22,
                "feels_like": 15.96,
                "temp_min": 16.22,
                "temp_max": 16.22,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1000,
                "humidity": 79,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03n"
                }
            ],
            "clouds": {
                "all": 44
            },
            "wind": {
                "speed": 3.01,
                "deg": 272,
                "gust": 6.88
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-24 21:00:00"
        },
        {
            "dt": 1779667200,
            "main": {
                "temp": 13.55,
                "feels_like": 13.39,
                "temp_min": 13.55,
                "temp_max": 13.55,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 999,
                "humidity": 93,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03n"
                }
            ],
            "clouds": {
                "all": 43
            },
            "wind": {
                "speed": 3.37,
                "deg": 295,
                "gust": 7.13
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-25 00:00:00"
        },
        {
            "dt": 1779678000,
            "main": {
                "temp": 13.9,
                "feels_like": 13.8,
                "temp_min": 13.9,
                "temp_max": 13.9,
                "pressure": 1020,
                "sea_level": 1020,
                "grnd_level": 999,
                "humidity": 94,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 77
            },
            "wind": {
                "speed": 4.12,
                "deg": 303,
                "gust": 10.12
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-25 03:00:00"
        },
        {
            "dt": 1779688800,
            "main": {
                "temp": 17.46,
                "feels_like": 17.3,
                "temp_min": 17.46,
                "temp_max": 17.46,
                "pressure": 1020,
                "sea_level": 1020,
                "grnd_level": 999,
                "humidity": 78,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 88
            },
            "wind": {
                "speed": 6.08,
                "deg": 330,
                "gust": 8.99
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-25 06:00:00"
        },
        {
            "dt": 1779699600,
            "main": {
                "temp": 19.78,
                "feels_like": 19.3,
                "temp_min": 19.78,
                "temp_max": 19.78,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 999,
                "humidity": 57,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 64
            },
            "wind": {
                "speed": 7.57,
                "deg": 339,
                "gust": 8.99
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-25 09:00:00"
        },
        {
            "dt": 1779710400,
            "main": {
                "temp": 19.96,
                "feels_like": 19.32,
                "temp_min": 19.96,
                "temp_max": 19.96,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 1000,
                "humidity": 50,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 80
            },
            "wind": {
                "speed": 7.51,
                "deg": 345,
                "gust": 9.66
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-25 12:00:00"
        },
        {
            "dt": 1779721200,
            "main": {
                "temp": 19.01,
                "feels_like": 18.56,
                "temp_min": 19.01,
                "temp_max": 19.01,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 999,
                "humidity": 61,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 73
            },
            "wind": {
                "speed": 6.13,
                "deg": 325,
                "gust": 9.69
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-25 15:00:00"
        },
        {
            "dt": 1779732000,
            "main": {
                "temp": 14.38,
                "feels_like": 13.86,
                "temp_min": 14.38,
                "temp_max": 14.38,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 1000,
                "humidity": 76,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 804,
                    "main": "Clouds",
                    "description": "overcast clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 87
            },
            "wind": {
                "speed": 3.69,
                "deg": 318,
                "gust": 8.93
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-25 18:00:00"
        },
        {
            "dt": 1779742800,
            "main": {
                "temp": 12.26,
                "feels_like": 11.6,
                "temp_min": 12.26,
                "temp_max": 12.26,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1001,
                "humidity": 79,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 74
            },
            "wind": {
                "speed": 3.34,
                "deg": 316,
                "gust": 5.2
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-25 21:00:00"
        },
        {
            "dt": 1779753600,
            "main": {
                "temp": 11.18,
                "feels_like": 10.6,
                "temp_min": 11.18,
                "temp_max": 11.18,
                "pressure": 1022,
                "sea_level": 1022,
                "grnd_level": 1000,
                "humidity": 86,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04n"
                }
            ],
            "clouds": {
                "all": 77
            },
            "wind": {
                "speed": 3.36,
                "deg": 301,
                "gust": 5.26
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "n"
            },
            "dt_txt": "2026-05-26 00:00:00"
        },
        {
            "dt": 1779764400,
            "main": {
                "temp": 11.21,
                "feels_like": 10.66,
                "temp_min": 11.21,
                "temp_max": 11.21,
                "pressure": 1021,
                "sea_level": 1021,
                "grnd_level": 999,
                "humidity": 87,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d"
                }
            ],
            "clouds": {
                "all": 30
            },
            "wind": {
                "speed": 3.41,
                "deg": 275,
                "gust": 8.02
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-26 03:00:00"
        },
        {
            "dt": 1779775200,
            "main": {
                "temp": 17.37,
                "feels_like": 17.07,
                "temp_min": 17.37,
                "temp_max": 17.37,
                "pressure": 1019,
                "sea_level": 1019,
                "grnd_level": 998,
                "humidity": 73,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d"
                }
            ],
            "clouds": {
                "all": 25
            },
            "wind": {
                "speed": 6.41,
                "deg": 290,
                "gust": 10.89
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-26 06:00:00"
        },
        {
            "dt": 1779786000,
            "main": {
                "temp": 20.71,
                "feels_like": 20.35,
                "temp_min": 20.71,
                "temp_max": 20.71,
                "pressure": 1017,
                "sea_level": 1017,
                "grnd_level": 996,
                "humidity": 58,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d"
                }
            ],
            "clouds": {
                "all": 49
            },
            "wind": {
                "speed": 7.33,
                "deg": 291,
                "gust": 10
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-26 09:00:00"
        },
        {
            "dt": 1779796800,
            "main": {
                "temp": 22.56,
                "feels_like": 22.44,
                "temp_min": 22.56,
                "temp_max": 22.56,
                "pressure": 1015,
                "sea_level": 1015,
                "grnd_level": 994,
                "humidity": 60,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 803,
                    "main": "Clouds",
                    "description": "broken clouds",
                    "icon": "04d"
                }
            ],
            "clouds": {
                "all": 53
            },
            "wind": {
                "speed": 8.21,
                "deg": 286,
                "gust": 11.49
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-26 12:00:00"
        },
        {
            "dt": 1779807600,
            "main": {
                "temp": 21.78,
                "feels_like": 21.79,
                "temp_min": 21.78,
                "temp_max": 21.78,
                "pressure": 1013,
                "sea_level": 1013,
                "grnd_level": 992,
                "humidity": 68,
                "temp_kf": 0
            },
            "weather": [
                {
                    "id": 802,
                    "main": "Clouds",
                    "description": "scattered clouds",
                    "icon": "03d"
                }
            ],
            "clouds": {
                "all": 28
            },
            "wind": {
                "speed": 7.69,
                "deg": 285,
                "gust": 11.61
            },
            "visibility": 10000,
            "pop": 0,
            "sys": {
                "pod": "d"
            },
            "dt_txt": "2026-05-26 15:00:00"
        }
    ];
    // return openweathermapApi.get(url, {params}).then(res => res.data?.list.map((item: any) => {
    //     const dtTxtSplitted = item.dt_txt.split(' ');
    //     return {
    //         ...item,
    //         dt_txt_day: dtTxtSplitted.at(0),
    //         dt_txt_time: dtTxtSplitted.at(1)
    //     } as WeatherList
    // }));

    return Promise.resolve(result.map(item => {
        const dtTxtSplitted = item.dt_txt.split(' ');
        return {
            ...item,
            dt_txt_day: dtTxtSplitted.at(0),
            dt_txt_time: dtTxtSplitted.at(1)
        } as WeatherList
    }));
  }
}
