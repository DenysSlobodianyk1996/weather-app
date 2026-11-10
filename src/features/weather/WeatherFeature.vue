<template>
  <div class="weather-feature">
    <WeatherTabs
      :id="tabsId"
      v-model="weatherTabMode"
      :main-count="cards.length"
      :favorite-count="favorites.length"
    >
      <template #actions v-if="weatherTabMode === 'main'">
        <span class="weather-feature__counter num">
          {{ t('cityCards.counter', { n: cards.length, max: MAX_CITY_CARDS }) }}
        </span>
        <Button
          :id="addCityId"
          variant="primary"
          class="weather-feature__add"
          @click="addCard"
        >
          <span class="material-icons" aria-hidden="true">add</span>
          <span class="weather-feature__add-label">{{ t('cityCards.addCity') }}</span>
        </Button>
      </template>
      <template #actions v-else>
        <span class="weather-feature__counter weather-feature__counter--favorites num">
          {{ t('favorites.counter', { n: favorites.length, max: MAX_FAVORITES }) }}
        </span>
      </template>
    </WeatherTabs>

    <div
      :id="`${tabsId}-panel`"
      role="tabpanel"
      :aria-labelledby="`${tabsId}-${weatherTabMode}`"
    >
      <MainWeatherTab
        v-if="weatherTabMode === 'main'"
        :cards="cards"
        :loading-card-id="ipLocationLoading ? firstCardId : undefined"
        @select="cityCards.setCardLocation"
        @toggle-favorite="toggleFavorite"
        @remove="removeCard"
      />
      <FavoriteWeatherTab
        v-else
        :favorites="favorites"
        @remove="cityCards.removeFavorite"
      />
    </div>

    <LimitModal
      :limit="limitModal?.limit ?? null"
      :city-name="limitModal?.cityName"
      @close="limitModal = null"
      @open-favorites="openFavorites"
    />
  </div>
</template>

<script setup lang="ts">
  import type { WeatherTabMode } from './models';
  import MainWeatherTab from './components/MainWeatherTab.vue';
  import FavoriteWeatherTab from './components/FavoriteWeatherTab.vue';
  import WeatherTabs from './components/WeatherTabs.vue';
  import LimitModal, { type Limit } from './components/LimitModal.vue';
  import { nextTick, ref, useId } from 'vue';
  import { GeoapifyApiService } from '@/services';
  import Button from '@/components/base/Button.vue';
  import { useAsyncData } from '@/composables';
  import { useI18n } from 'vue-i18n';
  import { browserStorage, MAX_CITY_CARDS, MAX_FAVORITES } from './city-cards';
  import { useCityCards } from './use-city-cards';

  const { t } = useI18n();

  // All City card and Favorite rules live in the City cards module; this component only shows them.
  const cityCards = useCityCards(browserStorage());
  const { cards, favorites } = cityCards;
  // The card the app starts with; the IP Location fills it.
  const firstCardId = cards.value[0].id;

  const tabsId = useId();
  const addCityId = useId();
  const weatherTabMode = ref<WeatherTabMode>('main');

  const {
    data: ipLocation,
    loading: ipLocationLoading,
    load: loadIpLocation,
  } = useAsyncData(() => GeoapifyApiService.getIpLocation());

  // A failed lookup leaves the first card empty, so the user can search for a city.
  loadIpLocation().then(() => {
    if(ipLocation.value) {
      cityCards.fillFirstCard(ipLocation.value);
    }
  });

  // The limit modal that is open, if any. The City cards module says when a limit is hit; this shows it.
  const limitModal = ref<{ limit: Limit, cityName?: string } | null>(null);

  function addCard() {
    if(!cityCards.addCard().ok) {
      limitModal.value = { limit: 'cards' };
    }
  }

  // The delete button that had focus goes away with its card, so focus moves to "Add city" instead of the page.
  function removeCard(id: number) {
    cityCards.removeCard(id);
    nextTick(() => {
      const active = document.activeElement;
      if(!active || active === document.body || !active.isConnected) {
        document.getElementById(addCityId)?.focus();
      }
    });
  }

  function toggleFavorite(id: number, cityName: string | undefined) {
    if(!cityCards.toggleFavorite(id).ok) {
      limitModal.value = { limit: 'favorites', cityName };
    }
  }

  // The heart that opened the modal goes away with the Main tab, so focus goes to the Favorites tab instead.
  function openFavorites() {
    limitModal.value = null;
    weatherTabMode.value = 'favorite';
    nextTick(() => document.getElementById(`${tabsId}-favorite`)?.focus());
  }
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

  // Phones: icon-only "Add city"; its counter and label stay for screen readers.
  @media (max-width: 599px) {
    .weather-feature__counter:not(.weather-feature__counter--favorites),
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
