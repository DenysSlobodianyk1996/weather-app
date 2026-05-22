<template>
  <div class="city-card">
    <template v-if="!hideToolbar">
      <div class="city-card__toolbar">
        <CitySearch @select="selectCity($event)" />
        <div class="toolbar-actions">
          <template v-if="!hideRemove">
            <ConfirmDialog
              id="remove-card" 
              @confirm="emit('remove', cityCard.id)">
              <template #dialogActivator="{props: activatorPros}">
                <Button
                  v-bind="activatorPros"
                  class="city-card__delete">
                  <span class="material-icons">delete_outline</span>
                </Button>
              </template>
              <template #dialogContent>
                <h3>Do you want to delete this card?</h3>
              </template>
            </ConfirmDialog>
          </template>
          <template v-if="!!cityLocation">
            <!-- Add to favorite if only city location is selected -->
            <Button
              class="city-card__favorite"
              @click="toggleFavorite">
              <span class="material-icons">{{ toggleFavoriteIcon }}</span>
            </Button>
          </template>
        </div>
      </div>
    </template>

    <template v-if="!!cityLocation">
      <CityWeather
        :weather5Days3HoursForecast="weather5Days3HoursForecast">
        <template #cityDetails>
          <CityDetails  :cityLocation="cityLocation" />
        </template>
      </CityWeather>
    </template>
    <template v-else>
      <p>Please select city</p>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { CityCardModel } from '../../models';
  import type { ForcastRequestModel, LocationModel, WeatherList } from '@/models';
  import { useI18n } from 'vue-i18n';
  import { WeatherApiService } from '@/services';
  import CitySearch from './CitySearch.vue'
  import CityDetails from './CityDetails.vue'
  import CityWeather from './CityWeather.vue'
  import ConfirmDialog from '@/components/base/ConfirmDialog.vue';
  import Button from '@/components/base/Button.vue';

  const { locale } = useI18n()
  const props = defineProps<{
    hideRemove?: boolean,
    hideToolbar?: boolean,
    cityCard: CityCardModel
  }>();
  const cityCard = computed(() => props.cityCard);
  const hideRemove = computed(() => props.hideRemove);
  const hideToolbar = computed(() => props.hideToolbar);
  const cityLocation = computed(() => cityCard.value.cityLocation);

  const toggleFavoriteIcon = computed(() => {
    const isFavorite = cityCard.value.isFavorite;
    return isFavorite
      ? 'favorite'
      : 'favorite_border'
  });

  const emit = defineEmits<{
    update: [updatedCityCard: CityCardModel],
    remove: [id: number]
  }>();

  const weather5Days3HoursForecast = ref<WeatherList[] | null>(null);

  function toggleFavorite() {
    const newIsFavorite = !cityCard.value.isFavorite;
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      isFavorite: newIsFavorite
    }
    emit('update', newCityCard)
  }

  function loadWeatherByLocation(request: ForcastRequestModel) {
     WeatherApiService.get5Days3HoursForecast(request)
      .then(weather => {
        weather5Days3HoursForecast.value = weather;
      })
  }

  function selectCity(newCityLocation: LocationModel) {
    const newCityCard: CityCardModel = {
      ...cityCard.value,
      cityLocation: newCityLocation
    }
    emit('update', newCityCard)
  }

  // Load weather data
  watch(
    () => ({
      lastLocale: locale.value,
      lastLocation: cityLocation.value,
    }),
    ({
      lastLocale,
      lastLocation
    }) => {
      if(!lastLocale || !lastLocation) {
        return;
      }
      loadWeatherByLocation({
        lang: lastLocale,
        ...lastLocation
      });
    },
    {
      immediate: true
    }
  )
</script>

<style lang="scss" scoped>
  .city-card {
    border: 1px solid #eee;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__toolbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      flex-wrap: wrap;

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    &__favorite {
      color: orange !important;
    }
    &__delete {
      color: red !important;
    }
  }
</style>