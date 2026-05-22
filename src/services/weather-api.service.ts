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

    return openweathermapApi.get(url, {params}).then(res => res.data?.list?.map((item: WeatherList) => {
        const dtTxtSplitted = item.dt_txt.split(' ');
        return {
          ...item,
          dt_txt_day: dtTxtSplitted.at(0),
          dt_txt_time: dtTxtSplitted.at(1)
        } as WeatherList
    }));
  }
}
