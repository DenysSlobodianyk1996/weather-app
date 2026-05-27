import type { LocationModel } from "@/models";

export const isEqualLocation = (item1?: LocationModel, item2?: LocationModel) => {
  return item1?.lat === item2?.lat && item1?.lon === item2?.lon;
}
