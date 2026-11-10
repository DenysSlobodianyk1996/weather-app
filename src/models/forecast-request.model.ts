import type { LocationModel } from './location.model';

export interface ForecastRequestModel extends LocationModel {
  lang: string
}
