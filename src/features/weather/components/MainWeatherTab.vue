<template>
  <div class="tab-cards">
    <section v-if="loading" class="card-placeholder">
      <CityCardSkeleton with-toolbar :label="t('cityCards.findingLocation')" />
    </section>
    <template v-for="cityCard in cityCards" :key="cityCard.id">
      <CityCard
        :city-card="cityCard"
        :hide-remove-action="cityCards.length <= 1"
        @remove="emit('remove', $event)"
        @update="emit('update', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { toRefs } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { CityCardModel } from '../models';
  import CityCard from './city-card/CityCard.vue';
  import CityCardSkeleton from './city-card/CityCardSkeleton.vue';

  const { t } = useI18n();

  const props = defineProps<{
    cityCards: CityCardModel[]
    /** The first City card is still waiting for the IP Location. */
    loading?: boolean
  }>();
  const { cityCards, loading } = toRefs(props);

  const emit = defineEmits<{
    update: [cityCard: CityCardModel],
    remove: [id: number]
  }>();

</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';

  // Same frame as a City card, so the page doesn't jump when the card arrives.
  .card-placeholder {
    padding: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-card);
  }

  @media (max-width: 599px) {
    .card-placeholder {
      padding: var(--space-4);
    }
  }
</style>
