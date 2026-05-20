import type { LocationModel, WeatherModel } from '@/models';
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
  get5Days3hoursForecast({
    lang,
    latitude: lat,
    longitude: lon
  }: LocationModel & {lang: string}) {
    const url = '/2.5/forecast';
    const params = {
      lang,
      lat,
      lon,
      units: 'metric'
    }
    return openweathermapApi.get<WeatherModel>(url, {params}).then(res => res.data)
  }
}
