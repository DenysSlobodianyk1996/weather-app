<template>
  <div class="city-card">
    <div class="city-card__toolbar">
      <SearchCity @select="selectCity($event)" />
      <div class="toolbar-actions">
        <template v-if="!hideRemove">
          <button
            class="city-card__delete"
            @click="emit('remove', cityCard.id)">
            <span class="material-icons">delete_outline</span>
          </button>
        </template>
        <template v-if="!!cityLocation">
          <!-- Add to favorite if only city location is selected -->
          <button class="city-card__favorite" @click="toggleFavorite">
            <span class="material-icons">{{ toggleFavoriteIcon }}</span>
          </button>
        </template>
      </div>
    </div>
    <p>{{ cityCard }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { CityCardModel } from '../models';
  import type { ForcastRequestModel, LocationModel, SearchCityModel, WeatherModel } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import SearchCity from './SearchCity.vue'

  const { locale } = useI18n()
  const props = defineProps<{
    hideRemove?: boolean,
    cityCard: CityCardModel
  }>();
  const cityCard = computed(() => props.cityCard);
  const hideRemove = computed(() => props.hideRemove);
  const cityLocation = computed(() => cityCard.value.cityLocation);

  const toggleFavoriteIcon = computed(() => {
    const isFavorite = cityCard.value.isFavorite;
    return isFavorite
      ? 'favorite'
      : 'favorite_border'
  });

  const emit = defineEmits<{
    update: [updatedCityCard: CityCardModel],
    remove: [id: number]
  }>();

  const weather5Days3HoursForecast = ref<WeatherModel | null>(null);

  function toggleFavorite() {
    const newIsFavorite = !cityCard.value.isFavorite;
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      isFavorite: newIsFavorite
    }
    emit('update', newCityCard)
  }

  function loadWeatherByLocation(request: ForcastRequestModel) {
     WeatherApiService.get5Days3HoursForecast(request)
      .then(weather => {
        console.log('get5Days3hoursForecast', weather);
        weather5Days3HoursForecast.value = weather
      })
  }

  function selectCity({ lat, lon}: SearchCityModel) {
    const newCityLocation: LocationModel = {
      latitude: lat,
      longitude: lon,
    };
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      cityLocation: newCityLocation
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
        locale: lastLocale,
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
    border: 1px solid #eee;
    padding: 24px;
    display: flex;
    flex-direction: column;

    &__toolbar {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    &__favorite,
    &__delete {
      display: flex;
      align-items: center;
      all: unset;
      cursor: pointer;
      border-radius: 4px;
      padding: 4px;
      &:hover {
        background-color: rgba($color: #eee, $alpha: .8);
      }
    }

    &__favorite {
      color: orange;
    }
    &__delete {
      color: red;
    }
  }
</style>