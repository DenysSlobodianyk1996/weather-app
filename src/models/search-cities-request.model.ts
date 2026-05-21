import type { LocationModel } from "./location.model";

export interface SearchCitiesRequest {
  text: string;
  lang: string;
}
export interface CityDetailsRequest extends LocationModel {
  lang: string;
}

export interface SearchCitiesResultModel extends LocationModel {
  place_id: string;
  cityLabel: string; // Generated on FE 
}
