<template>
  <!-- Loading placeholders from the "Card states" artboard: conditions row, then the table and chart blocks. -->
  <div class="city-card-skeleton" aria-busy="true">
    <div v-if="withToolbar" class="city-card-skeleton__toolbar">
      <Skeleton class="city-card-skeleton__search" height="var(--control-height)" />
      <Skeleton width="var(--control-height)" height="var(--control-height)" />
    </div>
    <div class="city-card-skeleton__conditions">
      <Skeleton width="52px" height="52px" radius="50%" />
      <Skeleton width="70px" height="44px" />
      <div class="city-card-skeleton__lines">
        <Skeleton width="70%" height="14px" radius="4px" />
        <Skeleton width="50%" height="12px" radius="4px" />
      </div>
    </div>
    <Skeleton height="120px" radius="var(--radius-lg)" />
    <Skeleton height="90px" radius="var(--radius-lg)" />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
  import Skeleton from '@/components/base/Skeleton.vue';

  defineProps<{
    /** What is loading, read out to screen readers. */
    label: string
    /** Also stand in for the search field and button row, for a card that has nothing yet. */
    withToolbar?: boolean
  }>();
</script>

<style lang="scss" scoped>
  .city-card-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    &__toolbar,
    &__conditions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__conditions {
      gap: var(--space-3);
    }

    &__search,
    &__lines {
      flex: 1;
      min-width: 0;
    }

    &__lines {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
