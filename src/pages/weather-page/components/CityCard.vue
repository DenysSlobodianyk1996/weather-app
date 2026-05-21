<template>
  <div class="city-card">
    <p>{{ cityCard }}</p>
    <button @click="emit('remove', cityCard.id)">Remove city card</button>
    <button @click="toggleFavorite">{{ toggleFavoriteTitle }}</button>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { CityCardModel } from '../models';
  import type { ForcastRequestModel, WeatherModel } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';

  const { locale } = useI18n()
  const props = defineProps<{
    cityCard: CityCardModel
  }>();
  const cityCard = computed(() => props.cityCard);

  const cityLocation = computed(() => cityCard.value.cityLocation);

  const toggleFavoriteTitle = computed(() => {
    const isFavorite = cityCard.value.isFavorite;
    return isFavorite
      ? 'Remove from Favorite'
      : 'Add to Favorite'
  })

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
      console.log('track data', lastLocale,lastLocation);
      
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
  }
</style>