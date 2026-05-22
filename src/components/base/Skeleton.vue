<template>
  <div class="skeleton" :style="styles"></div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    width?: string;
    height: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '100%'
  });

  const styles = computed(() => {
    const { width, height } = props;
    return { width, height }
  })
</script>

<style lang="scss" scoped>
  .skeleton {
    position: relative;
    overflow: hidden;
    background: #e5e7eb;
    border-radius: 8px;
  }

  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    animation: skeleton-loading 1.2s infinite;
  }

  @keyframes skeleton-loading {
    100% {
      transform: translateX(100%);
    }
  }
</style>