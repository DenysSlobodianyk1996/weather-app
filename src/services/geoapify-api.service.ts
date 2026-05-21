import type { IpInfoModel, SearchCitiesRequest, SearchCityModel } from '@/models';
import { uniqueByProps } from '@/utils';
import axios from 'axios'

const geoapifyApi = axios.create({
  baseURL: 'https://api.geoapify.com/v1',
  timeout: 2000,
});
geoapifyApi.interceptors.request.use(config => {
  if(!config.params) {
    config.params = {}
  }
  config.params.apiKey = import.meta.env.VITE_GEOAPIFY_KEY
  return config;
})

export const GeoapifyApiService = {
  getIpInfo() {
    const url = 'ipinfo';
    return Promise.resolve<IpInfoModel>({
      location: {latitude: 49.8004, longitude: 30.1285}
    })
    return geoapifyApi.get<IpInfoModel>(url).then(res => res.data)
  },
  searchCities({
    search: text,
    locale: lang
  }: SearchCitiesRequest) {
    const url = 'geocode/autocomplete';
    const params = {
      type: 'city',
      text,
      lang
    }
    return geoapifyApi.get(url, {params})
      .then(res => {
        const searchResult = res.data.features.map(({ properties }: any) => {
          const {lon, lat, city, state, country, municipality, place_id} = properties;
          const cityLabel = [
            city, state,
            municipality,
            country,
          ].filter(Boolean).join(', ');
        
          return { lon, lat, place_id, cityLabel } as SearchCityModel
        });
        return uniqueByProps(searchResult, ['lat', 'lon']);
      });
  }
}
