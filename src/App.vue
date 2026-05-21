<template>
  <Header />
  <Main>
    <WeatherPage />
  </Main>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import Header from '@/layouts/Header.vue'
  import Main from '@/layouts/Main.vue'
  import WeatherPage from './pages/weather-page'

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

