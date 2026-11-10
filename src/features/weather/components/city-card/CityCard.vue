<template>
  <section class="city-card" :class="{ 'city-card--favorite': isFavorite }">
    <CityCardToolbar
      v-if="variant === 'main'"
      :has-location="!!cityLocation"
      :is-favorite="isFavorite"
      :hide-remove-action="hideRemoveAction"
      :city-name="cityName"
      @select="emit('select', $event)"
      @toggle-favorite="emit('toggleFavorite', cityName)"
      @remove="emit('remove')"
    />

    <CityWeather
      v-if="cityLocation"
      :forecast="forecast"
      :loading="forecastLoading"
      :error="!!forecastError"
      @retry="retryForecast"
    >
      <template #cityDetails>
        <CityDetails :cityLocation="cityLocation" @name="cityName = $event" />
      </template>
      <template v-if="variant === 'favorite'" #actions>
        <RemoveFavoriteButton @remove="emit('remove')" />
      </template>
    </CityWeather>
    <div v-else-if="variant === 'main'" class="city-card__empty">
      <span class="material-icons city-card__empty-icon" aria-hidden="true">location_on</span>
      <span class="city-card__empty-title">{{ t('cityCard.pickCity') }}</span>
      <span class="city-card__empty-hint">{{ t('cityCard.pickCityHint', { n: MIN_SEARCH_CHARACTERS }) }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { ForecastRequestModel, LocationModel } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import { useAsyncData } from '@/composables';
  import { MIN_SEARCH_CHARACTERS } from '@/static';
  import CityCardToolbar from './CityCardToolbar.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'
  import RemoveFavoriteButton from './RemoveFavoriteButton.vue'

  const { locale, t } = useI18n()

  const props = withDefaults(defineProps<{
    cityLocation?: LocationModel
    /** The Location is a Favorite. Worked out by the City cards module, never stored on the card. */
    isFavorite?: boolean
    /**
     * `main`: the toolbar with city search, my location, heart and delete.
     * `favorite`: no toolbar; a "Remove" button next to the Day / 5 days switch.
     */
    variant?: 'main' | 'favorite'
    hideRemoveAction?: boolean
  }>(), {
    isFavorite: false,
    variant: 'main',
  });

  const emit = defineEmits<{
    select: [cityLocation: LocationModel]
    /** Carries the city name, so a "Favorites are full" modal can name it. */
    toggleFavorite: [cityName: string | undefined]
    /** `main`: delete the card (confirmed). `favorite`: remove the Favorite. */
    remove: []
  }>();

  /**
   * The city name CityDetails loaded for this card. Used by the delete confirmation and the Favorites limit modal.
   * CityDetails sends undefined while a new Location loads, so a stale name never shows.
   */
  const cityName = ref<string>();

  const {
    data: forecast,
    loading: forecastLoading,
    error: forecastError,
    load: loadForecast,
    retry: retryForecast,
  } = useAsyncData((request: ForecastRequestModel) => WeatherApiService.get5Days3HoursForecast(request));

  // Load weather data
  watch(
    () => ({
      lastLocale: locale.value,
      lastLocation: props.cityLocation,
    }),
    ({
      lastLocale,
      lastLocation
    }) => {
      if(!lastLocale || !lastLocation) {
        return;
      }
      loadForecast({
        lang: lastLocale,
        lat: lastLocation.lat,
        lon: lastLocation.lon,
      });
    },
    {
      immediate: true
    }
  )
</script>

<style lang="scss" scoped>
  .city-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    min-width: 0;
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-card);

    &__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 32px var(--space-4);
      text-align: center;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
    }

    &__empty-icon {
      font-size: 40px;
      color: var(--color-text-muted);
    }

    &__empty-title {
      font-weight: 600;
    }

    &__empty-hint {
      font-size: var(--font-size-md);
      color: var(--color-text-muted);
    }

    &--favorite {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 1px var(--color-accent), var(--shadow-card);
    }
  }

  @media (max-width: 599px) {
    .city-card {
      gap: var(--space-4);
      padding: var(--space-4);
    }
  }
</style>
