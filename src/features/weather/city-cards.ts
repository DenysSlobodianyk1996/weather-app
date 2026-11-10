import type { LocationModel } from '@/models';
import { FAVORITE_CITIES_KEY } from '@/static';
import { generateId, isSameLocation, uniqueLocations } from '@/utils';

/**
 * City cards module: the City cards on the Main tab, the Favorites, and the
 * rules between them. It has no UI; the weather feature displays it.
 *
 * A Favorite is a saved Location, not a City card. A card's favorite flag is
 * worked out from its Location on every read and is never stored.
 */

export const MAX_CITY_CARDS = 5;
export const MAX_FAVORITES = 5;

/** The part of Web Storage the module needs; `localStorage` fits as is. */
export interface CityCardsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * The browser's `localStorage`, or a storage in memory when the browser blocks it
 * (reading the global can throw, e.g. with cookies off). Favorites then last until the page closes.
 */
export function browserStorage(
  getStorage: () => CityCardsStorage | undefined = () => globalThis.localStorage,
): CityCardsStorage {
  try {
    const storage = getStorage();
    if(storage) {
      return storage;
    }
  } catch {
    // Fall through to the storage in memory.
  }
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

export interface CityCard {
  id: number;
  cityLocation?: LocationModel;
  /** Derived: the card's Location is the same place as a Favorite. */
  isFavorite: boolean;
}

export type AddCardResult =
  | { ok: true; id: number }
  | { ok: false; reason: 'cards-full' };

export type ToggleFavoriteResult =
  | { ok: true; isFavorite: boolean }
  | { ok: false; reason: 'favorites-full' };

export interface CityCards {
  /** The City cards, newest first, each with its derived favorite flag. */
  cards(): CityCard[];
  /** The Favorites, newest first. */
  favorites(): LocationModel[];
  /** Adds an empty card at the top, unless there are already MAX_CITY_CARDS. */
  addCard(): AddCardResult;
  /** Removes a card. The last card is never removed. Favorites don't change. */
  removeCard(id: number): void;
  /** Shows a Location on a card. Favorites never change; the same place again changes nothing. */
  setCardLocation(id: number, cityLocation: LocationModel): void;
  /**
   * Gives the IP Location to the card the module started with, if that card
   * is still there and still empty. Cards added meanwhile are left alone.
   */
  fillFirstCard(cityLocation: LocationModel): void;
  /** Saves or unsaves the card's Location, unless saving would pass MAX_FAVORITES. */
  toggleFavorite(id: number): ToggleFavoriteResult;
  /** Unsaves the Favorite at this place, if there is one. */
  removeFavorite(cityLocation: LocationModel): void;
}

interface StoredCard {
  id: number;
  cityLocation?: LocationModel;
}

export function createCityCards(storage: CityCardsStorage): CityCards {
  const firstCard: StoredCard = { id: generateId() };
  let cards: StoredCard[] = [firstCard];
  let favorites: LocationModel[] = loadFavorites(storage);

  const isFavorite = (cityLocation?: LocationModel) =>
    favorites.some(favorite => isSameLocation(favorite, cityLocation));

  function setFavorites(next: LocationModel[]) {
    favorites = next;
    saveFavorites(storage, favorites);
  }

  function replaceCard(id: number, cityLocation: LocationModel) {
    cards = cards.map(card => card.id === id ? { ...card, cityLocation } : card);
  }

  return {
    cards: () => cards.map(card => ({
      id: card.id,
      cityLocation: card.cityLocation,
      isFavorite: isFavorite(card.cityLocation),
    })),

    // The same Location objects until they change, so views don't reload forecasts for nothing.
    favorites: () => [...favorites],

    addCard() {
      if(cards.length >= MAX_CITY_CARDS) {
        return { ok: false, reason: 'cards-full' };
      }
      const id = generateId();
      cards = [{ id }, ...cards];
      return { ok: true, id };
    },

    removeCard(id) {
      if(cards.length <= 1) {
        return;
      }
      cards = cards.filter(card => card.id !== id);
    },

    setCardLocation(id, cityLocation) {
      const card = cards.find(item => item.id === id);
      if(!card || isSameLocation(card.cityLocation, cityLocation)) {
        return;
      }
      replaceCard(id, cityLocation);
    },

    fillFirstCard(cityLocation) {
      const card = cards.find(item => item.id === firstCard.id);
      if(!card || card.cityLocation) {
        return;
      }
      replaceCard(card.id, cityLocation);
    },

    toggleFavorite(id) {
      const cityLocation = cards.find(card => card.id === id)?.cityLocation;
      if(!cityLocation) {
        return { ok: true, isFavorite: false };
      }
      if(isFavorite(cityLocation)) {
        setFavorites(favorites.filter(favorite => !isSameLocation(favorite, cityLocation)));
        return { ok: true, isFavorite: false };
      }
      if(favorites.length >= MAX_FAVORITES) {
        return { ok: false, reason: 'favorites-full' };
      }
      setFavorites([toLocation(cityLocation), ...favorites]);
      return { ok: true, isFavorite: true };
    },

    removeFavorite(cityLocation) {
      if(isFavorite(cityLocation)) {
        setFavorites(favorites.filter(favorite => !isSameLocation(favorite, cityLocation)));
      }
    },
  };
}

// Storage keeps the old version's format: a JSON array of `{lat, lon}`.

const toLocation = ({ lat, lon }: LocationModel): LocationModel => ({ lat, lon });

const isLocation = (value: unknown): value is LocationModel =>
  typeof value === 'object' && value !== null &&
  Number.isFinite((value as LocationModel).lat) &&
  Number.isFinite((value as LocationModel).lon);

// Storage that can't be read (blocked, or broken JSON) starts with no Favorites.
function loadFavorites(storage: CityCardsStorage): LocationModel[] {
  let saved: unknown;
  try {
    saved = JSON.parse(storage.getItem(FAVORITE_CITIES_KEY) ?? '[]');
  } catch {
    return [];
  }
  if(!Array.isArray(saved)) {
    return [];
  }
  const locations = saved.filter(isLocation).map(toLocation);
  const favorites = uniqueLocations(locations);
  if(favorites.length !== saved.length) {
    // Write the cleaned list back, so old duplicates are gone for good.
    saveFavorites(storage, favorites);
  }
  return favorites;
}

// A failed write (storage full or blocked) keeps the Favorites in memory; they are written again on the next change.
function saveFavorites(storage: CityCardsStorage, favorites: LocationModel[]) {
  try {
    storage.setItem(FAVORITE_CITIES_KEY, JSON.stringify(favorites.map(toLocation)));
  } catch {
    // Nothing to do: the in-memory Favorites stay the truth for this page.
  }
}
