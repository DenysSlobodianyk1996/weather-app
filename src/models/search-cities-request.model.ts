export interface SearchCitiesRequest {
  search: string;
  locale: string;
}

export interface SearchCityModel {
  place_id: string;
  lon: number;
  lat: number;
  cityLabel: string; // Generated on FE 
}
