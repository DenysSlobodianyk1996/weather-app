import { shallowRef, type Ref } from 'vue';
import type { LocationModel } from '@/models';
import { createCityCards, type CityCard, type CityCards, type CityCardsStorage } from './city-cards';

export type ReactiveCityCards = Omit<CityCards, 'cards' | 'favorites'> & {
  cards: Readonly<Ref<CityCard[]>>
  favorites: Readonly<Ref<LocationModel[]>>
};

/** The City cards module with its cards and Favorites as refs that update after every operation. */
export function useCityCards(storage: CityCardsStorage): ReactiveCityCards {
  const cityCards = createCityCards(storage);
  const cards = shallowRef(cityCards.cards());
  const favorites = shallowRef(cityCards.favorites());

  function synced<A extends unknown[], R>(operation: (...args: A) => R) {
    return (...args: A): R => {
      const result = operation(...args);
      cards.value = cityCards.cards();
      favorites.value = cityCards.favorites();
      return result;
    };
  }

  return {
    cards,
    favorites,
    addCard: synced(cityCards.addCard),
    removeCard: synced(cityCards.removeCard),
    setCardLocation: synced(cityCards.setCardLocation),
    fillFirstCard: synced(cityCards.fillFirstCard),
    toggleFavorite: synced(cityCards.toggleFavorite),
    removeFavorite: synced(cityCards.removeFavorite),
  };
}
