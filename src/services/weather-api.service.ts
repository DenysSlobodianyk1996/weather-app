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
});

openweathermapApi.interceptors.response.use(
  res => res,
  error => {
    console.error('Catched error', error);
    return Promise.reject(error);
  }
);

const weatherCache = new Map<string, WeatherList[]>();

export const WeatherApiService = {
  get5Days3HoursForecast(request: ForcastRequestModel) {
    const url = '/2.5/forecast';
    const params = {
      ...request,
      units: 'metric'
    }
    // Object key in Map is always unique. Map().has - returns false for the same object structure. Convert obj to string
    const paramsString = JSON.stringify(params); 

    if(weatherCache.has(paramsString)) {
      return Promise.resolve(weatherCache.get(paramsString)!);
    }

    return openweathermapApi.get(url, {params})
      .then(res => res.data?.list?.map((item: WeatherList) => {
        const dtTxtSplitted = item.dt_txt.split(' ');
        return {
          ...item,
          dt_txt_day: dtTxtSplitted.at(0),
          dt_txt_time: dtTxtSplitted.at(1)
        } as WeatherList
      }))
      .then((weatherResult: WeatherList[]) => {
        weatherCache.set(paramsString, weatherResult);
        return weatherResult;
      })
      .catch(() => []);
  }
}
