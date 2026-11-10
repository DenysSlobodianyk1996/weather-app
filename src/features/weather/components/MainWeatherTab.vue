<template>
  <div class="tab-cards">
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
  import type { CityCardModel } from '../models';
  import CityCard from './city-card/CityCard.vue';

  const props = defineProps<{
    cityCards: CityCardModel[]
  }>();
  const { cityCards } = toRefs(props);

  const emit = defineEmits<{
    update: [cityCard: CityCardModel],
    remove: [id: number]
  }>();

</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';
</style>
