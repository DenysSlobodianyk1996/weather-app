import type { LocationModel } from './ip-info.model';

export interface ForcastRequestModel extends LocationModel {
  locale: string
}
