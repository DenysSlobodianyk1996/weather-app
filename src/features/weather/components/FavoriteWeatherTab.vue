<template>
  <div class="tab-cards">
    <CityCard
      v-for="favorite in favorites"
      :key="locationKey(favorite)"
      variant="favorite"
      :city-location="favorite"
      is-favorite
      @remove="emit('remove', favorite)"
    />
    <section v-if="favorites.length === 0" class="favorites-empty">
      <div class="favorites-empty__icon">
        <span class="material-icons" aria-hidden="true">favorite_border</span>
      </div>
      <span class="favorites-empty__title">{{ t('favorites.emptyTitle') }}</span>
      <span class="favorites-empty__hint">{{ t('favorites.emptyHint', { max: MAX_FAVORITES }) }}</span>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import type { LocationModel } from '@/models';
  import { locationKey } from '@/utils';
  import { MAX_FAVORITES } from '../city-cards';
  import CityCard from './city-card/CityCard.vue';

  const { t } = useI18n();

  defineProps<{
    favorites: LocationModel[]
  }>();

  const emit = defineEmits<{
    remove: [cityLocation: LocationModel]
  }>();
</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';

  .favorites-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: 40px var(--space-6);
    text-align: center;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-xl);

    &__icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-accent-soft);
      color: var(--color-accent);

      .material-icons {
        font-size: 22px;
      }
    }

    &__title {
      font-weight: 600;
    }

    &__hint {
      max-width: 34ch;
      font-size: var(--font-size-md);
      color: var(--color-text-muted);
    }
  }
</style>
