<template>
  <div class="city-card">
    <div class="city-card__toolbar">
      <CitySearch @select="selectCity($event)" />
      <div class="toolbar-actions">
        <template v-if="!hideRemoveAction">
          <ConfirmDialog
            id="remove-card" 
            @confirm="emit('remove', cityCard.id)">
            <template #dialogActivator="{props: activatorPros}">
              <Button
                v-bind="activatorPros"
                class="city-card__delete">
                <span class="material-icons">delete_outline</span>
              </Button>
            </template>
            <template #dialogContent>
              <h3>{{ t('message.deleteThisCard') }}</h3>
            </template>
          </ConfirmDialog>
        </template>
        <template v-if="!!cityLocation && !hideFavoriteAction">
          <!-- Add to favorite if only city location is selected -->
          <Button
            class="city-card__favorite"
            @click="toggleFavorite">
            <span class="material-icons">{{ toggleFavoriteIcon }}</span>
          </Button>
        </template>
      </div>
    </div>

    <template v-if="!!cityLocation">
      <CityWeather
        :weather5Days3HoursForecast="weather5Days3HoursForecast"
        :weather5Days3HoursForecastLoading="weather5Days3HoursForecastLoading">
        <template #cityDetails>
          <CityDetails  :cityLocation="cityLocation" />
        </template>
      </CityWeather>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, toRefs, watch } from 'vue';
  import type { CityCardModel } from '../../models';
  import type { ForcastRequestModel, LocationModel, WeatherList } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import CitySearch from './CitySearch.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'
  import ConfirmDialog from '@/components/base/ConfirmDialog.vue';
  import Button from '@/components/base/Button.vue';

  const { locale, t } = useI18n()

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

  const toggleFavoriteIcon = computed(() => {
    return isFavorite.value
      ? 'favorite'
      : 'favorite_border'
  });

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
      .then(weather => {
        weather5Days3HoursForecast.value = weather;
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
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__toolbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      flex-wrap: wrap;

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
    }

    &__favorite {
      color: orange !important;
    }
    &__delete {
      color: red !important;
    }
  }
</style>