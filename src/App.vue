<template>
  <Header />
  <Main>
    <WeatherFeature />
  </Main>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import Header from '@/components/layout/Header.vue'
  import Main from '@/components/layout/Main.vue'
  import WeatherFeature from '@/features/weather/WeatherFeature.vue'

  import { useI18n } from 'vue-i18n'
  import { StorageService } from './services';
  import { SELECTED_LANGUAGE_KEY } from './static';

  const { locale } = useI18n()

  watch(
    () => locale.value,
    currentLocale => {
      StorageService.setItem(SELECTED_LANGUAGE_KEY, currentLocale)
    },
    {
      immediate: true
    }
  )
</script>

