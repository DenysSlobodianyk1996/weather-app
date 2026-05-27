<template>
  <div class="tab-cards">
    <template v-for="cityCard in favoriteCityCards" :key="cityCard.id">
      <CityCard
        :city-card="cityCard"
        :hide-favorite-action="true"
        @remove="emit('remove', $event)"
      />
    </template>
    <template v-if="favoriteCityCards.length === 0">
      <p class="no-data">{{ t('message.noData') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { toRefs } from 'vue';
  import type { CityCardModel } from '../models';
  import CityCard from './city-card/CityCard.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const props = defineProps<{
    favoriteCityCards: CityCardModel[]
  }>();
  const { favoriteCityCards } = toRefs(props);

  const emit = defineEmits<{
    remove: [id: number],
  }>();
</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';

  .tab-cards {
    margin-top: 56px;
  }
</style>