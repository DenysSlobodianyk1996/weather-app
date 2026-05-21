import type { LocationModel } from './location.model';

export interface ForcastRequestModel extends LocationModel {
  lang: string
}
