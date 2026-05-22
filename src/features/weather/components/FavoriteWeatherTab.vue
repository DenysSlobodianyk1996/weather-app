<template>
  <div class="tab-cards">
    <template v-for="cityCard in favoriteCityCards" :key="cityCard.id">
      <CityCard
        :city-card="cityCard"
        :hideToolbar="true"
        @update="emit('update', $event)"
      />
    </template>
    <template v-if="favoriteCityCards.length === 0">
      <p class="no-data">{{ t('message.noData') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { CityCardModel } from '../models';
  import CityCard from './city-card/CityCard.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const props = defineProps<{
    favoriteCityCards: CityCardModel[]
  }>()
  const favoriteCityCards = computed(() => props.favoriteCityCards);

  const emit = defineEmits<{
    update: [updatedCityCard: CityCardModel],
  }>();
</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';

  .tab-cards {
    margin-top: 56px;
  }
</style>