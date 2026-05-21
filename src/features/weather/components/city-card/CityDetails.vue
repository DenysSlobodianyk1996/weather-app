<template>
  <template v-if="loading">
    <p>Loading...</p>
  </template>
  <template v-else>
    <p>{{ cityDetails?.cityLabel }}</p>
  </template>
</template>

<script setup lang="ts">
  import type { CityDetailsRequest, LocationModel, SearchCitiesResultModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n() 

  const props = defineProps<{
    cityLocation: LocationModel,
  }>();
  const loading = ref(false);

  // loadCityDetails logic
  const cityDetails = ref<SearchCitiesResultModel | null>(null);

  function loadCityDetails(request: CityDetailsRequest) {
    loading.value = true;
    GeoapifyApiService.getCityDetails(request)
      .then(res => {
        cityDetails.value = res;
      })
      .finally(() => {
        loading.value = false;
      })
  }

  watch(
    () => ({
      lastCityLocation: props.cityLocation,
      lastLocale: locale.value,
    }),
    ({lastCityLocation, lastLocale}) => {
      if(!lastCityLocation || !lastLocale) {
        return;
      }
      loadCityDetails({
        ...lastCityLocation,
        lang: lastLocale,
      });
    },
    {
      immediate: true
    }
  )
</script>

<style lang="scss" scoped>
  .city-details {

  }
</style>
