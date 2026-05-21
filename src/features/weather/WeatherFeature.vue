<template>
  <div class="wheather-feature">
    <div class="wheather-feature__tabs">
      <button
        :class="{
          active: weatherTabMode === 'main'
        }"
        @click="setTabMode('main')">Main</button>
      <button
        :class="{
          active: weatherTabMode === 'favorite'
        }"
        @click="setTabMode('favorite')">Favorite</button>
   </div>

    <template v-if="weatherTabMode === 'main'">
      <MainWeatherTab
        :cityCards="cityCards"
        @add="addCityCard"
        @update="updateCityCard($event)"
        @remove="removeCityCard($event)"
      />
    </template>
    <template v-else>
      <FavoriteWeatherTab
        :favoriteCityCards="favoriteCityCards"
        @update="updateCityCard($event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import type { CityCardModel, WeatherTabMode } from './models';
  import MainWeatherTab from './components/MainWeatherTab.vue';
  import FavoriteWeatherTab from './components/FavoriteWeatherTab.vue';
  import { computed, onMounted, ref, watch } from 'vue';
  import { GeoapifyApiService, StorageService } from '@/services';
  import { generateId } from '@/utils';
  import { FAVORITE_CITIES_KEY, MAX_CITY_CARDS_AMOUNT } from '@/static';
  import type { LocationModel } from '@/models';

  const { t } = useI18n()

  const cityCards = ref<CityCardModel[]>([]);
  const favoriteCityCards = computed<CityCardModel[]>(() => cityCards.value.filter(item => item.isFavorite));

  // Tab mode logic
  const weatherTabMode = ref<WeatherTabMode>('main')
  function setTabMode(newTabMode: WeatherTabMode) {
    weatherTabMode.value = newTabMode;
  }

  // Init city cards
  function initialyzeCityCards() {
    const favoriteLocations: LocationModel[] = StorageService.getItem(FAVORITE_CITIES_KEY, true);
    const predefinedLocations = favoriteLocations?.length > 0 ? favoriteLocations : null;

    if(predefinedLocations?.length) {
      // If we have favorite before - use this list as default state
      const initCityCards: CityCardModel[] = predefinedLocations.map(cityLocation => ({
        id: generateId(),
        cityLocation,
        isFavorite: true
      }));
      cityCards.value = initCityCards;
      return;
    }

    // If no favorite before - setup first card with city by IP
    GeoapifyApiService.getIpInfo()
      .then(ipInfo => {
        const ipLocation = ipInfo.location;
        const cityCard: CityCardModel = {
          id: generateId(),
          cityLocation: ipLocation
        };
        cityCards.value = [cityCard]
      });
  }

  // City cards CRUD
  function addCityCard() {
    if(cityCards.value.length === MAX_CITY_CARDS_AMOUNT) {
      console.error('Max amount of cards')
      return;
    }
    const newCityCard: CityCardModel = {
      id: generateId()
    };
    cityCards.value.push(newCityCard)
  }
  function updateCityCard(updatedCityCard: CityCardModel) {
    const cardIndex = cityCards.value.findIndex(item => item.id === updatedCityCard.id);
    if(cardIndex === -1) {
      console.error('Card wasn\'t found');
      return;
    }
    const cityCardsCopy = [...cityCards.value];
    cityCardsCopy[cardIndex] = updatedCityCard;
    cityCards.value = cityCardsCopy;
  }
  function removeCityCard(id: number) {
    if(cityCards.value.length === 1) {
      console.error('Min amount of cards');
      return;
    }
    cityCards.value = cityCards.value.filter(item => item.id !== id);
  }

  // Init component
  onMounted(() => {
    initialyzeCityCards();
  })

  // Save favorites to storage
  watch(
    () => favoriteCityCards.value,
    updatedFavoriteCityCards => {
      const storageFavoriteCities: LocationModel[] = updatedFavoriteCityCards
        .map(({ cityLocation }) => cityLocation!);
      StorageService.setItem(FAVORITE_CITIES_KEY, storageFavoriteCities)
    }
  )
</script>

<style lang="scss" scoped>
  .wheather-feature {
    display: flex;
    flex-direction: column;
    padding: 24px;
    max-width: 100%;

    &__tabs {
      button {
        all: unset;
        border-radius: 4px;
        cursor: pointer;
        padding: 8px 16px;
        background: rgba($color: #ddd, $alpha: .4);
        &.active {
          background: #ddd;
        }
      }
    }
  }
</style>