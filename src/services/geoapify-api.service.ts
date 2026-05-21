import type { CityDetailsRequest, LocationModel, SearchCitiesRequest, SearchCitiesResultModel } from '@/models';
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

let ipLocationCache: LocationModel | null = null;
const cityDetailsCache = new Map<string, SearchCitiesResultModel>();

export const GeoapifyApiService = {
  getIpLocation() {
    const url = 'ipinfo';
    return Promise.resolve<LocationModel>({lat: 49.8004, lon: 30.1285});
  
    if(!!ipLocationCache) {
      return Promise.resolve(ipLocationCache!);
    }
    return geoapifyApi.get(url).then(res => {
      const {
        latitude: lat, longitude: lon
      } = res.data?.location;
      const ipLocation = { lat, lon };
      ipLocationCache = ipLocation;
      return ipLocation;
    })
  },

  getCityDetails(request: CityDetailsRequest) {
    const url = 'geocode/reverse';
    const params = {
      ...request,
      type: 'city',
    };
    // Object key in Map is always unique. Map().has - returns false for the same object structure. Convert obj to string
    const paramsString = JSON.stringify(params); 

    if(cityDetailsCache.has(paramsString)) {
      return Promise.resolve(cityDetailsCache.get(paramsString)!);
    }

    return geoapifyApi.get(url, {params})
      .then(res => {
        const resultProperties = res.data?.features?.[0]?.properties;
        const searchCitiesResult = getSearchCitiesResultModel(resultProperties)!;
        cityDetailsCache.set(paramsString, searchCitiesResult);
        return searchCitiesResult;
      })
  },

  searchCities(request: SearchCitiesRequest) {
    const url = 'geocode/autocomplete';
    const params = {
      ...request,
      type: 'city',
    }
    return geoapifyApi.get(url, {params})
      .then(res => {
        const searchResult = res.data.features.map(({ properties }: any) => {
          const searchCitiesResult = getSearchCitiesResultModel(properties);
          return searchCitiesResult;
        });
        return uniqueByProps(searchResult, ['lat', 'lon']) as SearchCitiesResultModel[];
      });
  }
}

function getSearchCitiesResultModel(properties: any) {
  if(!properties) {
    return null;
  }
  const {lon, lat, city, state, country, municipality, place_id} = properties;
  const cityLabel = [
    city, state,
    municipality,
    country,
  ].filter(Boolean).join(', ');

  return { lon, lat, place_id, cityLabel } as SearchCitiesResultModel
}
