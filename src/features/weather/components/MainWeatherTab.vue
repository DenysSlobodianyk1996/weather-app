<template>
  <div class="tab-toolbar">
    <Button
      class="add-action"
      @click="emit('add')">
      <span class="material-icons">add_circle</span>
    </Button>
  </div>
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
  import Button from '@/components/base/Button.vue';

  const props = defineProps<{
    cityCards: CityCardModel[]
  }>();
  const { cityCards } = toRefs(props);

  const emit = defineEmits<{
    add: [],
    update: [cityCard: CityCardModel],
    remove: [id: number]
  }>();

</script>

<style lang="scss" scoped>
  @use './shared-tab-styles.scss';

  .add-action {
    background-color: transparent;
    color: rgba($color: green, $alpha: .8);
    &:hover {
      color: green;
    }
  }
</style>