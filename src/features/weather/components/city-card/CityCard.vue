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

    <template v-if="!!cityLocation">
      <template v-if="forecastError">
        <div class="city-card__header">
          <div class="city-card__details">
            <CityDetails :cityLocation="cityLocation" @name="cityName = $event" />
          </div>
          <RemoveFavoriteButton v-if="variant === 'favorite'" @remove="emit('remove')" />
        </div>
        <ForecastError @retry="retryForecast" />
      </template>
      <CityWeather
        v-else
        :forecast="forecast"
        :loading="forecastLoading">
        <template #cityDetails>
          <CityDetails :cityLocation="cityLocation" @name="cityName = $event" />
        </template>
        <template v-if="variant === 'favorite'" #actions>
          <RemoveFavoriteButton @remove="emit('remove')" />
        </template>
      </CityWeather>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { ForcastRequestModel, LocationModel } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import { useAsyncData } from '@/composables';
  import CityCardToolbar from './CityCardToolbar.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'
  import ForecastError from './ForecastError.vue'
  import RemoveFavoriteButton from './RemoveFavoriteButton.vue'

  const { locale } = useI18n()

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

  const cityLocation = computed(() => props.cityLocation);

  /** The city name CityDetails loaded for this card. Used by the delete confirmation and the Favorites limit modal. */
  const cityName = ref<string>();
  watch(cityLocation, () => {
    cityName.value = undefined;
  });

  const {
    data: forecast,
    loading: forecastLoading,
    error: forecastError,
    load: loadForecast,
    retry: retryForecast,
  } = useAsyncData((request: ForcastRequestModel) => WeatherApiService.get5Days3HoursForecast(request));

  // Load weather data
  watch(
    () => ({
      lastLocale: locale.value,
      lastLocation: cityLocation.value,
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

    &__header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4) var(--space-5);
    }

    &__details {
      flex: 1 1 auto;
      min-width: 0;
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
