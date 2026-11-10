<template>
  <section class="city-card" :class="{ 'city-card--favorite': isFavorite }">
    <CityCardToolbar
      :has-location="!!cityLocation"
      :is-favorite="!!isFavorite"
      :hide-remove-action="hideRemoveAction"
      :hide-favorite-action="hideFavoriteAction"
      @select="selectCity($event)"
      @toggle-favorite="toggleFavorite"
      @remove="emit('remove', cityCard.id)"
    />

    <template v-if="!!cityLocation">
      <template v-if="forecastError">
        <CityDetails :cityLocation="cityLocation" />
        <ForecastError @retry="retryForecast" />
      </template>
      <CityWeather
        v-else
        :weather5Days3HoursForecast="forecastList"
        :weather5Days3HoursForecastLoading="forecastLoading">
        <template #cityDetails>
          <CityDetails :cityLocation="cityLocation" />
        </template>
      </CityWeather>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed, toRefs, watch } from 'vue';
  import type { CityCardModel } from '../../models';
  import type { ForcastRequestModel, LocationModel } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import { useAsyncData } from '@/composables';
  import CityCardToolbar from './CityCardToolbar.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'
  import ForecastError from './ForecastError.vue'

  const { locale } = useI18n()

  const props = defineProps<{
    cityCard: CityCardModel,
    hideRemoveAction?: boolean,
    hideFavoriteAction?: boolean,
  }>();

  const {
    cityCard,
    hideRemoveAction,
    hideFavoriteAction,
  } = toRefs(props);

  const cityLocation = computed(() => cityCard.value.cityLocation);
  const isFavorite = computed(() => cityCard.value.isFavorite);

  const emit = defineEmits<{
    update: [cityCard: CityCardModel],
    remove: [id: number]
  }>();

  const {
    data: forecast,
    loading: forecastLoading,
    error: forecastError,
    load: loadForecast,
    retry: retryForecast,
  } = useAsyncData((request: ForcastRequestModel) => WeatherApiService.get5Days3HoursForecast(request));
  const forecastList = computed(() => forecast.value?.list ?? null);

  function toggleFavorite() {
    const newIsFavorite = !cityCard.value.isFavorite;
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      isFavorite: newIsFavorite
    }
    emit('update', newCityCard)
  }

  function selectCity(newCityLocation: LocationModel) {
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      cityLocation: newCityLocation,
      isFavorite: false
    }
    emit('update', newCityCard)
  }

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
        ...lastLocation
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
