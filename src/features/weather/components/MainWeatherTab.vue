<template>
  <div class="tab-toolbar">
    <p>Main tab</p>
    <button @click="emit('add')">Add Card</button>
  </div>
  <div class="tab-cards">
    <template v-for="cityCard in cityCards" :key="cityCard.id">
      <CityCard
        :city-card="cityCard"
        @remove="emit('remove', $event)"
        @update="emit('update', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { CityCardModel } from '../models';
  import CityCard from './CityCard.vue';

  const props = defineProps<{
    cityCards: CityCardModel[]
  }>();
  const cityCards = computed(() => props.cityCards);

  const emit = defineEmits<{
    add: [],
    update: [updatedCityCard: CityCardModel],
    remove: [id: number]
  }>();

</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';
</style>