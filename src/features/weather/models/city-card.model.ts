import type { LocationModel } from "@/models";

export interface CityCardModel {
  id: number;
  cityLocation?: LocationModel;
  isFavorite?: boolean;
}
