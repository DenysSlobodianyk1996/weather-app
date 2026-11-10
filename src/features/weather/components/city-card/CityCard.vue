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
      <CityWeather
        :weather5Days3HoursForecast="weather5Days3HoursForecast"
        :weather5Days3HoursForecastLoading="weather5Days3HoursForecastLoading">
        <template #cityDetails>
          <CityDetails  :cityLocation="cityLocation" />
        </template>
      </CityWeather>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, toRefs, watch } from 'vue';
  import type { CityCardModel } from '../../models';
  import type { ForcastRequestModel, LocationModel, WeatherList } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import CityCardToolbar from './CityCardToolbar.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'

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

  const weather5Days3HoursForecast = ref<WeatherList[] | null>(null);
  const weather5Days3HoursForecastLoading = ref(false);

  function toggleFavorite() {
    const newIsFavorite = !cityCard.value.isFavorite;
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      isFavorite: newIsFavorite
    }
    emit('update', newCityCard)
  }

  function loadWeatherByLocation(request: ForcastRequestModel) {
    weather5Days3HoursForecastLoading.value = true;
     WeatherApiService.get5Days3HoursForecast(request)
      .then(result => {
        // Until #7 adds error states, a failure shows as an empty forecast.
        weather5Days3HoursForecast.value = result.ok ? result.data.list : [];
      })
      .finally(() => {
        weather5Days3HoursForecastLoading.value = false;
      })
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
      loadWeatherByLocation({
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
