import { describe, expect, it } from 'vitest'
import { FAVORITE_CITIES_KEY } from '@/static'
import type { LocationModel } from '@/models'
import { useCityCards } from './use-city-cards'
import {
  browserStorage,
  createCityCards,
  MAX_CITY_CARDS,
  MAX_FAVORITES,
  type CityCardsStorage,
} from './city-cards'

const kyiv = { lat: 50.45, lon: 30.52 }
const lviv = { lat: 49.84, lon: 24.03 }
const odesa = { lat: 46.48, lon: 30.72 }
// Kyiv again, as a search or IP lookup can return it: same place, other digits.
const kyivAgain = { lat: 50.4501, lon: 30.5234 }

const places: LocationModel[] = [
  { lat: 1, lon: 1 },
  { lat: 2, lon: 2 },
  { lat: 3, lon: 3 },
  { lat: 4, lon: 4 },
  { lat: 5, lon: 5 },
  { lat: 6, lon: 6 },
]

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const storage: CityCardsStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
  }
  return {
    storage,
    saved: () => JSON.parse(values.get(FAVORITE_CITIES_KEY) ?? 'null'),
  }
}

function setup(savedFavorites?: unknown) {
  const memory = memoryStorage(
    savedFavorites === undefined ? {} : { [FAVORITE_CITIES_KEY]: JSON.stringify(savedFavorites) }
  )
  const cityCards = createCityCards(memory.storage)
  const firstCard = () => cityCards.cards()[0]
  return { cityCards, firstCard, saved: memory.saved }
}

describe('City cards module', () => {
  describe('starting up', () => {
    it('starts with one empty City card and no Favorites', () => {
      const { cityCards } = setup()

      expect(cityCards.cards()).toEqual([
        { id: expect.any(Number), cityLocation: undefined, isFavorite: false },
      ])
      expect(cityCards.favorites()).toEqual([])
    })

    it('loads Favorites saved by the old version (same key, array of {lat, lon})', () => {
      const { cityCards } = setup([kyiv, lviv])

      expect(cityCards.favorites()).toEqual([kyiv, lviv])
    })

    it('merges same-place duplicates in saved Favorites on load and saves the clean list', () => {
      const { cityCards, saved } = setup([kyiv, lviv, kyivAgain, lviv])

      expect(cityCards.favorites()).toEqual([kyiv, lviv])
      expect(saved()).toEqual([kyiv, lviv])
    })

    it('ignores saved data that is not a list of Locations', () => {
      expect(setup({ lat: 1 }).cityCards.favorites()).toEqual([])
      expect(setup([kyiv, null, { lat: 'x', lon: 1 }, 'kyiv']).cityCards.favorites()).toEqual([kyiv])

      const broken = memoryStorage({ [FAVORITE_CITIES_KEY]: '{not json' })
      expect(createCityCards(broken.storage).favorites()).toEqual([])
    })
  })

  describe('the IP Location', () => {
    it('fills the first City card', () => {
      const { cityCards, firstCard } = setup()

      cityCards.fillFirstCard(kyiv)

      expect(firstCard().cityLocation).toEqual(kyiv)
    })

    it('marks the first card as a Favorite when the IP Location is the same place as one', () => {
      const { cityCards, firstCard } = setup([kyiv])

      cityCards.fillFirstCard(kyivAgain)

      expect(firstCard().isFavorite).toBe(true)
    })

    it('does not replace a card added while the lookup was running', () => {
      const { cityCards } = setup()
      const [startCard] = cityCards.cards()
      cityCards.addCard()

      cityCards.fillFirstCard(kyiv)

      const [added, start] = cityCards.cards()
      expect(added.cityLocation).toBeUndefined()
      expect(start).toMatchObject({ id: startCard.id, cityLocation: kyiv })
    })

    it('does not overwrite a city the user already picked on the first card', () => {
      const { cityCards, firstCard } = setup()
      cityCards.setCardLocation(firstCard().id, lviv)

      cityCards.fillFirstCard(kyiv)

      expect(cityCards.cards()).toHaveLength(1)
      expect(firstCard().cityLocation).toEqual(lviv)
    })

    it('does nothing once the first card was removed', () => {
      const { cityCards } = setup()
      const [startCard] = cityCards.cards()
      cityCards.addCard()
      cityCards.removeCard(startCard.id)

      cityCards.fillFirstCard(kyiv)

      expect(cityCards.cards()).toEqual([expect.objectContaining({ cityLocation: undefined })])
    })
  })

  describe('City cards', () => {
    it('adds an empty card at the top', () => {
      const { cityCards } = setup()
      const [startCard] = cityCards.cards()

      const result = cityCards.addCard()

      expect(result).toEqual({ ok: true, id: expect.any(Number) })
      expect(cityCards.cards().map(card => card.id)).toEqual([result.ok && result.id, startCard.id])
      expect(cityCards.cards()[0].cityLocation).toBeUndefined()
    })

    it(`refuses a card past ${MAX_CITY_CARDS} and says the limit was hit`, () => {
      const { cityCards } = setup()
      for(let i = 1; i < MAX_CITY_CARDS; i++) {
        expect(cityCards.addCard().ok).toBe(true)
      }

      expect(cityCards.addCard()).toEqual({ ok: false, reason: 'cards-full' })
      expect(cityCards.cards()).toHaveLength(MAX_CITY_CARDS)
    })

    it('removes a card', () => {
      const { cityCards } = setup()
      cityCards.addCard()
      const [added, start] = cityCards.cards()

      cityCards.removeCard(added.id)

      expect(cityCards.cards().map(card => card.id)).toEqual([start.id])
    })

    it('never removes the last card', () => {
      const { cityCards, firstCard } = setup()
      const { id } = firstCard()

      cityCards.removeCard(id)

      expect(cityCards.cards().map(card => card.id)).toEqual([id])
    })

    it('keeps the Favorite when a favorite card is removed', () => {
      const { cityCards } = setup([kyiv])
      cityCards.addCard()
      const [added] = cityCards.cards()
      cityCards.setCardLocation(added.id, kyiv)

      cityCards.removeCard(added.id)

      expect(cityCards.favorites()).toEqual([kyiv])
    })

    it('sets a card\'s Location', () => {
      const { cityCards, firstCard } = setup()

      cityCards.setCardLocation(firstCard().id, lviv)

      expect(firstCard()).toMatchObject({ cityLocation: lviv, isFavorite: false })
    })
  })

  describe('Favorites', () => {
    it('saves the card\'s Location as a Favorite and fills its heart', () => {
      const { cityCards, firstCard, saved } = setup()
      cityCards.fillFirstCard(kyiv)

      const result = cityCards.toggleFavorite(firstCard().id)

      expect(result).toEqual({ ok: true, isFavorite: true })
      expect(firstCard().isFavorite).toBe(true)
      expect(cityCards.favorites()).toEqual([kyiv])
      expect(saved()).toEqual([kyiv])
    })

    it('saves only lat and lon, in the old format', () => {
      const { cityCards, firstCard, saved } = setup()
      const searchResult = { ...lviv, place_id: 'lviv', cityLabel: 'Lviv, Ukraine' }
      cityCards.setCardLocation(firstCard().id, searchResult)

      cityCards.toggleFavorite(firstCard().id)

      expect(cityCards.favorites()).toEqual([lviv])
      expect(saved()).toEqual([lviv])
    })

    it('puts the newest Favorite first', () => {
      const { cityCards, firstCard } = setup([kyiv])
      cityCards.setCardLocation(firstCard().id, lviv)

      cityCards.toggleFavorite(firstCard().id)

      expect(cityCards.favorites()).toEqual([lviv, kyiv])
    })

    it('removes the Favorite when a filled heart is toggled', () => {
      const { cityCards, firstCard, saved } = setup([kyiv, lviv])
      cityCards.fillFirstCard(kyivAgain)

      const result = cityCards.toggleFavorite(firstCard().id)

      expect(result).toEqual({ ok: true, isFavorite: false })
      expect(firstCard().isFavorite).toBe(false)
      expect(cityCards.favorites()).toEqual([lviv])
      expect(saved()).toEqual([lviv])
    })

    it('does nothing when the card has no Location yet', () => {
      const { cityCards, firstCard } = setup()

      expect(cityCards.toggleFavorite(firstCard().id)).toEqual({ ok: true, isFavorite: false })
      expect(cityCards.favorites()).toEqual([])
    })

    it('fills the heart on every card showing the same place', () => {
      const { cityCards } = setup()
      cityCards.addCard()
      const [added, start] = cityCards.cards()
      cityCards.setCardLocation(start.id, kyiv)
      cityCards.setCardLocation(added.id, kyivAgain)

      cityCards.toggleFavorite(start.id)

      expect(cityCards.cards().map(card => card.isFavorite)).toEqual([true, true])
    })

    it(`refuses a Favorite past ${MAX_FAVORITES} and says the limit was hit`, () => {
      const { cityCards, firstCard } = setup(places.slice(0, MAX_FAVORITES))
      cityCards.setCardLocation(firstCard().id, places[MAX_FAVORITES])

      expect(cityCards.toggleFavorite(firstCard().id)).toEqual({ ok: false, reason: 'favorites-full' })
      expect(firstCard().isFavorite).toBe(false)
      expect(cityCards.favorites()).toHaveLength(MAX_FAVORITES)
    })

    it('still lets a full list remove a Favorite through the heart', () => {
      const { cityCards, firstCard } = setup(places.slice(0, MAX_FAVORITES))
      cityCards.setCardLocation(firstCard().id, places[0])

      expect(cityCards.toggleFavorite(firstCard().id)).toEqual({ ok: true, isFavorite: false })
      expect(cityCards.favorites()).toHaveLength(MAX_FAVORITES - 1)
    })

    it('removes a Favorite and empties the heart of any card showing that place', () => {
      const { cityCards, firstCard, saved } = setup([kyiv, lviv])
      cityCards.fillFirstCard(kyiv)

      cityCards.removeFavorite(kyivAgain)

      expect(cityCards.favorites()).toEqual([lviv])
      expect(firstCard().isFavorite).toBe(false)
      expect(firstCard().cityLocation).toEqual(kyiv)
      expect(saved()).toEqual([lviv])
    })
  })

  describe('old Favorite bugs', () => {
    it('keeps the old city a Favorite when a favorite card gets a new city, with no duplicates', () => {
      // Old bug: changing a favorited card's city and favoriting the new one
      // made duplicate Favorites that disappeared together.
      const { cityCards, firstCard } = setup()
      cityCards.fillFirstCard(kyiv)
      cityCards.toggleFavorite(firstCard().id)

      cityCards.setCardLocation(firstCard().id, lviv)
      expect(cityCards.favorites()).toEqual([kyiv])
      expect(firstCard().isFavorite).toBe(false)

      cityCards.toggleFavorite(firstCard().id)
      expect(cityCards.favorites()).toEqual([lviv, kyiv])

      cityCards.toggleFavorite(firstCard().id)
      expect(cityCards.favorites()).toEqual([kyiv])
    })

    it('never saves the same place twice, from any card', () => {
      // Old bug: the same city could be saved twice.
      const { cityCards } = setup()
      cityCards.addCard()
      const [added, start] = cityCards.cards()
      cityCards.setCardLocation(start.id, kyiv)
      cityCards.setCardLocation(added.id, kyivAgain)

      cityCards.toggleFavorite(start.id)
      // The second card's heart is already filled, so a click removes the one Favorite.
      cityCards.toggleFavorite(added.id)
      expect(cityCards.favorites()).toEqual([])

      cityCards.toggleFavorite(added.id)
      cityCards.toggleFavorite(added.id)
      cityCards.toggleFavorite(start.id)
      expect(cityCards.favorites()).toHaveLength(1)
    })

    it('changes nothing when the same city is picked again on a card', () => {
      // Old bug: picking the same city again silently removed it from Favorites.
      const { cityCards, firstCard, saved } = setup()
      cityCards.fillFirstCard(kyiv)
      cityCards.toggleFavorite(firstCard().id)
      const before = cityCards.cards()

      cityCards.setCardLocation(firstCard().id, kyivAgain)

      expect(cityCards.cards()).toEqual(before)
      expect(firstCard().cityLocation).toEqual(kyiv)
      expect(firstCard().isFavorite).toBe(true)
      expect(cityCards.favorites()).toEqual([kyiv])
      expect(saved()).toEqual([kyiv])
    })
  })

  it('keeps each Favorite the same object while it is unchanged', () => {
    const { cityCards, firstCard } = setup([kyiv, lviv])
    const [, lvivBefore] = cityCards.favorites()
    cityCards.setCardLocation(firstCard().id, odesa)

    cityCards.toggleFavorite(firstCard().id)
    cityCards.removeFavorite(kyiv)

    expect(cityCards.favorites()[1]).toBe(lvivBefore)
  })

  it('keeps the Location of a card and the Favorites separate objects', () => {
    const { cityCards, firstCard } = setup()
    const picked = { ...odesa }
    cityCards.setCardLocation(firstCard().id, picked)
    cityCards.toggleFavorite(firstCard().id)

    picked.lat = 0

    expect(cityCards.favorites()).toEqual([odesa])
  })

  describe('when storage fails', () => {
    const quotaExceeded = () => { throw new DOMException('full', 'QuotaExceededError') }
    const blocked = () => { throw new DOMException('blocked', 'SecurityError') }

    it('starts with no Favorites when storage cannot be read', () => {
      const cityCards = createCityCards({ getItem: blocked, setItem: () => {} })

      expect(cityCards.favorites()).toEqual([])
      expect(cityCards.cards()).toHaveLength(1)
    })

    it('keeps the cleaned Favorites when they cannot be written back on load', () => {
      const storage: CityCardsStorage = {
        getItem: () => JSON.stringify([kyiv, kyivAgain]),
        setItem: quotaExceeded,
      }

      expect(createCityCards(storage).favorites()).toEqual([kyiv])
    })

    it('keeps the Favorites in memory when storage cannot be written', () => {
      const cityCards = createCityCards({ getItem: () => null, setItem: quotaExceeded })
      const id = cityCards.cards()[0].id
      cityCards.setCardLocation(id, kyiv)

      expect(cityCards.toggleFavorite(id)).toEqual({ ok: true, isFavorite: true })
      expect(cityCards.favorites()).toEqual([kyiv])
      expect(cityCards.cards()[0].isFavorite).toBe(true)

      cityCards.removeFavorite(kyiv)
      expect(cityCards.favorites()).toEqual([])
    })

    it('keeps the reactive cards and Favorites in sync when storage cannot be written', () => {
      const cityCards = useCityCards({ getItem: () => null, setItem: quotaExceeded })
      const id = cityCards.cards.value[0].id
      cityCards.setCardLocation(id, kyiv)

      cityCards.toggleFavorite(id)

      expect(cityCards.favorites.value).toEqual([kyiv])
      expect(cityCards.cards.value[0].isFavorite).toBe(true)
    })

    it('uses the browser storage when it can be reached', () => {
      const { storage } = memoryStorage({ [FAVORITE_CITIES_KEY]: JSON.stringify([kyiv]) })

      expect(browserStorage(() => storage)).toBe(storage)
    })

    it('falls back to storage in memory when the browser storage cannot be reached', () => {
      const storage = browserStorage(blocked)
      storage.setItem(FAVORITE_CITIES_KEY, '[]')

      expect(storage.getItem(FAVORITE_CITIES_KEY)).toBe('[]')
      expect(createCityCards(browserStorage(() => undefined as unknown as Storage)).favorites()).toEqual([])
    })
  })
})
