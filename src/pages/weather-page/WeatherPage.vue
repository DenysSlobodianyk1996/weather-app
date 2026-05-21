<template>
  <div class="whether-page">
    <p>Whether app</p>
    <div>
        <button @click="setTabMode('main')">Main</button>
        <button @click="setTabMode('favorite')">Favorite</button>
    </div>

    <template v-if="weatherTabMode === 'main'">
      <MainWeatherTab />
    </template>
    <template v-else>
      <FavoriteWeatherTab />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { WeatherTabMode } from './models';
  import MainWeatherTab from './components/MainWeatherTab.vue';
  import FavoriteWeatherTab from './components/FavoriteWeatherTab.vue';

  const { t } = useI18n()

  // Tab mode logic
  const weatherTabMode = ref<WeatherTabMode>('main')
  function setTabMode(newTabMode: WeatherTabMode) {
    weatherTabMode.value = newTabMode;
  }
</script>

<style scoped>
  .whether-page {
    display: flex;
    flex-direction: column;
    padding: 24px;
    max-width: 100%;
  }

</style>