<template>
  <div class="weather-feature">
    <WeatherTabs
      :id="tabsId"
      v-model="weatherTabMode"
      :main-count="cityCards.length"
      :favorite-count="favoriteCityCards.length"
    >
      <template #actions v-if="weatherTabMode === 'main'">
        <span class="weather-feature__counter num">
          {{ t('cityCards.counter', { n: cityCards.length, max: MAX_CITY_CARDS_AMOUNT }) }}
        </span>
        <Button
          variant="primary"
          class="weather-feature__add"
          @click="addCityCard"
        >
          <span class="material-icons" aria-hidden="true">add</span>
          <span class="weather-feature__add-label">{{ t('cityCards.addCity') }}</span>
        </Button>
      </template>
    </WeatherTabs>

    <div
      :id="`${tabsId}-panel`"
      role="tabpanel"
      :aria-labelledby="`${tabsId}-${weatherTabMode}`"
    >
      <template v-if="weatherTabMode === 'main'">
        <MainWeatherTab
          :cityCards="cityCards"
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
  </div>
</template>

<script setup lang="ts">
  import type { CityCardModel, WeatherTabMode } from './models';
  import MainWeatherTab from './components/MainWeatherTab.vue';
  import FavoriteWeatherTab from './components/FavoriteWeatherTab.vue';
  import WeatherTabs from './components/WeatherTabs.vue';
  import { onMounted, ref, useId, watch } from 'vue';
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
  const tabsId = useId();
  const weatherTabMode = ref<WeatherTabMode>('main')

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
      .then(result => {
        // Until #7 adds error states, a failed lookup leaves the first card empty.
        const ipLocation = result.ok ? result.data : undefined;
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
  .weather-feature {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    min-width: 0;

    &__counter {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  }

  // Phones: icon-only "Add city"; the counter and label stay for screen readers.
  @media (max-width: 599px) {
    .weather-feature__counter,
    .weather-feature__add-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .weather-feature .weather-feature__add {
      width: var(--control-height);
      padding: 0;
    }
  }
</style>
