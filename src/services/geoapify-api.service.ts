import type { CityDetailsRequest, LocationModel, SearchCitiesRequest, SearchCitiesResultModel } from '@/models';
import { uniqueLocations } from '@/utils';
import { request } from './request.service';

// The IP Location and a place's name don't change while the page is open.
const GEOCODING_TTL_MS = Infinity;
// Autocomplete answers are kept for a while only, so the cache doesn't grow with every word typed all day.
const SEARCH_TTL_MS = 10 * 60 * 1000;

export const GeoapifyApiService = {
  getIpLocation() {
    return request<LocationModel>({
      api: 'geoapify',
      url: 'ipinfo',
      ttl: GEOCODING_TTL_MS,
      parse: raw => {
        const { latitude: lat, longitude: lon } = raw.location;
        return { lat, lon };
      },
    });
  },

  getCityDetails(cityDetailsRequest: CityDetailsRequest) {
    return request<SearchCitiesResultModel | null>({
      api: 'geoapify',
      url: 'geocode/reverse',
      params: {
        ...cityDetailsRequest,
        type: 'city',
      },
      ttl: GEOCODING_TTL_MS,
      parse: raw => getSearchCitiesResultModel(raw?.features?.[0]?.properties),
    });
  },

  searchCities(searchRequest: SearchCitiesRequest) {
    return request<SearchCitiesResultModel[]>({
      api: 'geoapify',
      url: 'geocode/autocomplete',
      params: {
        ...searchRequest,
        type: 'city',
      },
      ttl: SEARCH_TTL_MS,
      parse: raw => {
        const searchResult = raw.features.map(({ properties }: any) => getSearchCitiesResultModel(properties));
        return uniqueLocations(searchResult.filter(Boolean) as SearchCitiesResultModel[]);
      },
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
