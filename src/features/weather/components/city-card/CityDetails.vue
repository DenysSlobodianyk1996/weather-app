<template>
  <template v-if="loading">
    <Skeleton height="18.5px" />
  </template>
  <template v-else>
    <h2 class="city-details__title">{{ cityDetails?.cityLabel ?? 'N/A' }}</h2>
  </template>
</template>

<script setup lang="ts">
  import Skeleton from '@/components/base/Skeleton.vue';
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
      .then(result => {
        cityDetails.value = result.ok ? result.data : null;
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
  .city-details__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    line-height: 1.3;
  }

  @media (max-width: 599px) {
    .city-details__title {
      font-size: 16px;
    }
  }
</style>
