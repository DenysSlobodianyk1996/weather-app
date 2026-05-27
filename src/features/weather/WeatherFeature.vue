<template>
  <div class="wheather-feature">
    <div class="wheather-feature__tabs">
      <Button
        :class="{
          active: weatherTabMode === 'main'
        }"
        @click="setTabMode('main')">{{ t('viewMode.main') }} ({{ cityCards.length }})</Button>
      <Button
        :class="{
          active: weatherTabMode === 'favorite'
        }"
        @click="setTabMode('favorite')">{{ t('viewMode.favorite') }} ({{ favoriteCityCards.length }})</Button>
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
        @remove="removeFavoriteCityCard($event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { CityCardModel, WeatherTabMode } from './models';
  import MainWeatherTab from './components/MainWeatherTab.vue';
  import FavoriteWeatherTab from './components/FavoriteWeatherTab.vue';
  import { onMounted, ref, watch } from 'vue';
  import { GeoapifyApiService, StorageService } from '@/services';
  import { generateId, isEqualLocation } from '@/utils';
  import { FAVORITE_CITIES_KEY, MAX_CITY_CARDS_AMOUNT } from '@/static';
  import type { LocationModel } from '@/models';
  import Button from '@/components/base/Button.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const cityCards = ref<CityCardModel[]>([]);
  const favoriteCityCards = ref<CityCardModel[]>([]);

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
      // Define Favorite list
      const initFavoriteCityCards: CityCardModel[] = predefinedLocations.map(cityLocation => ({
        id: generateId(),
        cityLocation,
        isFavorite: true
      }));
      favoriteCityCards.value = initFavoriteCityCards;
    }

    GeoapifyApiService.getIpLocation()
      .then(ipLocation => {
        // Load ip location. If it was in favorite - use same obj values.
        const ipLocationCityCardInFavorite = favoriteCityCards.value.find(item => isEqualLocation(item.cityLocation!, ipLocation))
        const initCityCard: CityCardModel = ipLocationCityCardInFavorite ?? {
          id: generateId(),
          cityLocation: ipLocation,
          isFavorite: false
        };
        cityCards.value = [initCityCard]
      });
  }

  // Main tab city cards logic
  function addCityCard() {
    if(cityCards.value.length === MAX_CITY_CARDS_AMOUNT) {
      alert(t('message.maxCards'));
      return;
    }
    const newCityCard: CityCardModel = {
      id: generateId()
    };
    cityCards.value = [
      newCityCard,
      ...cityCards.value
    ];
  }
  function updateCityCard(changedCityCard: CityCardModel) {
    const cardIndex = cityCards.value.findIndex(item => item.id === changedCityCard.id);
    if(cardIndex === -1) {
      return;
    }
    const cityCardsCopy = [...cityCards.value];
    const oldCityCard = cityCardsCopy[cardIndex];

    // Location changed
    if(
      (!oldCityCard.cityLocation && !!changedCityCard.cityLocation) ||
      !isEqualLocation(oldCityCard.cityLocation!, changedCityCard.cityLocation!)
    ) {
      cityCardsCopy[cardIndex] = changedCityCard;
      cityCards.value = cityCardsCopy;
      return;
    }

    // Is favorite changed
    if(oldCityCard.isFavorite !== changedCityCard.isFavorite) {
      if(changedCityCard.isFavorite && favoriteCityCards.value.length === 5) {
        alert(t('message.maxFavoriteCards'));
        return;
      }

      // update main city cards list
      cityCardsCopy[cardIndex] = changedCityCard;
      cityCards.value = cityCardsCopy;

      if(changedCityCard.isFavorite) {
        // Add item to favorite list
        favoriteCityCards.value = [
          changedCityCard,
          ...favoriteCityCards.value
        ];
      } else {
        // Remove item to favorite list
        favoriteCityCards.value = favoriteCityCards.value.filter(item => item.id !== changedCityCard.id);
      }
      return;
    }
  }
  function removeCityCard(id: number) {
    if(cityCards.value.length === 1) {
      return;
    }
    cityCards.value = cityCards.value.filter(item => item.id !== id);
  }

  // Favorite tab city cards logic
  function removeFavoriteCityCard(id: number) {
    favoriteCityCards.value = favoriteCityCards.value.filter(item => item.id !== id);
    
    const favoriteCityCardInMain = cityCards.value.find(card => card.id === id);
    if(!favoriteCityCardInMain) {
      return;
    }
    updateCityCard({
      ...favoriteCityCardInMain,
      isFavorite: false
    });
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
        padding: 8px 16px;
      }
    }
  }
</style>