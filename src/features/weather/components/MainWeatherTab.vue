<template>
  <div class="tab-cards">
    <template v-for="card in cards" :key="card.id">
      <section v-if="card.id === loadingCardId" class="card-placeholder">
        <CityCardSkeleton with-toolbar :label="t('cityCards.findingLocation')" />
      </section>
      <CityCard
        v-else
        :city-location="card.cityLocation"
        :is-favorite="card.isFavorite"
        :hide-remove-action="cards.length <= 1"
        @select="emit('select', card.id, $event)"
        @toggle-favorite="emit('toggleFavorite', card.id, $event)"
        @remove="emit('remove', card.id)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import type { LocationModel } from '@/models';
  import type { CityCard as CityCardModel } from '../city-cards';
  import CityCard from './city-card/CityCard.vue';
  import CityCardSkeleton from './city-card/CityCardSkeleton.vue';

  const { t } = useI18n();

  defineProps<{
    cards: CityCardModel[]
    /** This card is still waiting for the IP Location, so it shows a placeholder. */
    loadingCardId?: number
  }>();

  const emit = defineEmits<{
    select: [id: number, cityLocation: LocationModel]
    toggleFavorite: [id: number, cityName: string | undefined]
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
