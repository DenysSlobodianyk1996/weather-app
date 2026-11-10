import type { LocationModel } from '@/models';

// Two Locations are the same place when lat and lon match to 2 decimal places.
const toHundredths = (value: number) => Math.round(value * 100);

/** A key that is equal for, and only for, Locations at the same place. */
export const locationKey = ({ lat, lon }: LocationModel): string =>
  // `+ 0` turns -0 into 0, so -0.001 and 0 give the same key.
  `${toHundredths(lat) + 0},${toHundredths(lon) + 0}`;

export const isSameLocation = (a?: LocationModel, b?: LocationModel): boolean =>
  !!a && !!b && locationKey(a) === locationKey(b);

/** Drops every Location that is the same place as an earlier one. */
export const uniqueLocations = <T extends LocationModel>(locations: T[]): T[] => {
  const seen = new Set<string>();
  return locations.filter(location => {
    const key = locationKey(location);
    if(seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
