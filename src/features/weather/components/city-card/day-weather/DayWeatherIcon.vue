<template>
  <img class="day-weather-icon" :src="iconSrc" :alt="alt" :title="alt" width="28" height="28" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    icon: string;
    alt: string;
  }>();

  const iconSrc = computed(() => {
    return `https://openweathermap.org/img/wn/${props.icon}@2x.png`;
  })
</script>

<style lang="scss" scoped>
  .day-weather-icon {
    display: inline-block;
    width: 28px;
    height: 28px;
    vertical-align: middle;
  }
</style>
