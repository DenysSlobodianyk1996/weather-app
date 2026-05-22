<template>
  <img :src="iconSrc" :alt="alt" />
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
  img {
    width: 24px;
    height: 24px;
  }
</style>