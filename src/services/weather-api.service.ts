import type { ForcastRequestModel, ForecastModel, WeatherList } from '@/models';
import { request } from './request.service';

export const FORECAST_TTL_MS = 10 * 60 * 1000;

export const WeatherApiService = {
  get5Days3HoursForecast(forecastRequest: ForcastRequestModel) {
    return request<ForecastModel>({
      api: 'openWeather',
      url: '/2.5/forecast',
      params: {
        ...forecastRequest,
        units: 'metric',
      },
      ttl: FORECAST_TTL_MS,
      parse: raw => {
        const timezoneOffset = raw.city?.timezone;
        if(typeof timezoneOffset !== 'number') {
          throw new Error('Forecast response has no city.timezone');
        }
        const list = raw.list.map((item: WeatherList) => {
          const [dt_txt_day, dt_txt_time] = item.dt_txt.split(' ');
          return { ...item, dt_txt_day, dt_txt_time };
        });
        return { list, timezoneOffset };
      },
    });
  }
}
