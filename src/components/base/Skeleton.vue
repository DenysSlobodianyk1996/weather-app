<template>
  <div class="skeleton" :style="styles" aria-hidden="true"></div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    width?: string;
    height: string;
    /** Corner radius; defaults to the control radius. */
    radius?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '100%'
  });

  const styles = computed(() => {
    const { width, height, radius } = props;
    return { width, height, borderRadius: radius }
  })
</script>

<style lang="scss" scoped>
  .skeleton {
    position: relative;
    overflow: hidden;
    background: var(--color-surface-muted);
    border-radius: var(--radius-md);
  }

  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-shimmer),
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