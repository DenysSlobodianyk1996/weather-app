<template>
  <div>
    <p>Whether app</p>
    <p>{{ weatherData }}</p>
  </div>
</template>

<script setup lang="ts">
  import type { LocationModel, WeatherModel } from '@/models';
  import { WeatherApiService } from '@/services';
  import { GeoapifyApiService } from '@/services/geoapify-api.service';
  import { onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n()

  const weatherData = ref<WeatherModel | null>(null)
  const weatherDataLocation = ref<LocationModel | null>(null)

  function loadCurrentLocation() {
    GeoapifyApiService.getIpInfo()
      .then(ipInfo => {
        weatherDataLocation.value = ipInfo.location;
      });
  }

  function loadLocationWeatherData(lang: string, weatherDataLocation: LocationModel) {
     WeatherApiService.get5Days3hoursForecast({
      lang,
      ...weatherDataLocation
     })
      .then(weather => {
        console.log('get5Days3hoursForecast', weather);
        weatherData.value = weather
      })
  }

  onMounted(() => {
    loadCurrentLocation();
  })

  watch(
    () => ({
      lastLocale: locale.value,
      lastWeatherDataLocation: weatherDataLocation.value,
    }),
    ({
      lastLocale,
      lastWeatherDataLocation
    }) => {
      if(!lastLocale || !lastWeatherDataLocation) {
        return;
      }
      loadLocationWeatherData(lastLocale, lastWeatherDataLocation)
    }
  )
</script>

<style scoped>

</style>