<template>
  <div class="tab-toolbar">
    <p>Main tab</p>
    <button @click="addCityCard">Add Card</button>
  </div>
  <div class="tab-cards">
    <template v-for="cityCard in cityCards" :key="cityCard.id">
      <CityCard
        :city-card="cityCard"
        @remove="removeCityCard($event)"
        @update="updateCityCard($event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import CityCard from './CityCard.vue';
  import type { CityCardModel } from '../models';
  import { GeoapifyApiService } from '@/services';
  import { generateId } from '@/utils';
  import { MAX_CITY_CARDS_AMOUNT } from '@/static';

  const cityCards = ref<CityCardModel[]>([]);

  function initCityCards() {
    // Setup first card with city by IP
    GeoapifyApiService.getIpInfo()
      .then(ipInfo => {
        const ipLocation = ipInfo.location;
        const cityCard: CityCardModel = {
          id: generateId(),
          cityLocation: ipLocation
        };
        cityCards.value = [cityCard]
      });
  }

  function addCityCard() {
    if(cityCards.value.length === MAX_CITY_CARDS_AMOUNT) {
      console.error('Max amount of cards')
      return;
    }
    const newCityCard: CityCardModel = {
      id: generateId()
    };
    cityCards.value.push(newCityCard)
  }

  function updateCityCard(updatedCityCard: CityCardModel) {
    const cardIndex = cityCards.value.findIndex(item => item.id === updatedCityCard.id);
    if(cardIndex === -1) {
      console.error('Card wasn\'t found');
      return;
    }
    const cityCardsCopy = [...cityCards.value];
    cityCardsCopy[cardIndex] = updatedCityCard;
    cityCards.value = cityCardsCopy;
  }

  function removeCityCard(id: number) {
    if(cityCards.value.length === 1) {
      console.error('Min amount of cards');
      return;
    }
    cityCards.value = cityCards.value.filter(item => item.id !== id);
  }

  onMounted(() => {
    initCityCards();
  })
</script>

<style lang="scss" scoped>
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
  }
  .tab-cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    gap: 16px;
    .city-card {
      width: calc(50% - 8px);
      box-sizing: border-box;
    }
  }
</style>