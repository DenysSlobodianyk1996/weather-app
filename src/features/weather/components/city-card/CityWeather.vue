<template>
  <div class="city-weather">
    <div class="city-weather__header">
      <div class="city-weather__view-mode">
        <Button
          :class="{
            active: viewMode === 'day'
          }"
          @click="setViewMode('day')">{{ t('viewMode.day') }}</Button>
        <Button
          :class="{
            active: viewMode === 'week'
          }"
          @click="setViewMode('week')">{{ t('viewMode.week') }}</Button>
      </div>
      <slot name="cityDetails"></slot>
    </div>

    <template v-if="weather5Days3HoursForecastLoading">
      <Skeleton height="560px" />
    </template>
    <template v-else>
      <div class="city-weather__days-list">
        <div class="days-list__tabs">
          <template v-if="viewMode === 'day'">
            <Button class="active">{{ selectedDate }}</Button>
          </template>
          <template v-else>
            <template v-for="day in weatherForecastDays" :key="day">
              <Button 
                :class="{
                  active: selectedDate === day
                }"
                @click="selectDay(day)">{{ day }}</Button>
            </template>
          </template>
        </div>
        <template v-if="selectedDateWeatherForecast.length">
          <DayWeatherSummary :selectedDateWeatherForecast="selectedDateWeatherForecast" />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import Button from '@/components/base/Button.vue';
  import { computed, ref, watch } from 'vue';
  import type { WeatherViewMode } from '../../models';
  import type { WeatherList } from '@/models';
  import DayWeatherSummary from './day-weather/DayWeatherSummary.vue'
  import Skeleton from '@/components/base/Skeleton.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    weather5Days3HoursForecast: WeatherList[] | null,
    weather5Days3HoursForecastLoading: boolean
  }>()
  const weather5Days3HoursForecast = computed(() => props.weather5Days3HoursForecast);
  const weather5Days3HoursForecastLoading = computed(() => props.weather5Days3HoursForecastLoading);

  const weatherForecastGroupByDays = computed(() => {
    const groupedList: Record<string, WeatherList[]> = {};
    weather5Days3HoursForecast.value?.forEach(item => {
      const day = item.dt_txt_day!;
      if(!groupedList[day]) {
        groupedList[day] = []
      }
      groupedList[day].push(item);
    });
    return groupedList;
  });

  const weatherForecastDays = computed(() => Object.keys(weatherForecastGroupByDays.value));

  const viewMode = ref<WeatherViewMode>('day');
  const selectedDate = ref<string>('');

  const selectedDateWeatherForecast = computed<WeatherList[]>(() => {
    const currentSelectedDate = selectedDate.value;
    const currentWeatherForecastGroupByDays = weatherForecastGroupByDays.value;
    if(!currentSelectedDate || !currentWeatherForecastGroupByDays) {
      return []
    }
    return currentWeatherForecastGroupByDays[currentSelectedDate] ?? [];
  });

  function setViewMode(newViewMode: WeatherViewMode) {
    viewMode.value = newViewMode;
  }
  function selectDay(newDay: string) {
    selectedDate.value = newDay ?? '';
  }

  // Set init selected date
  watch(
    () => ({
      newWeatherForecastDays: weatherForecastDays.value,
      newViewMode: viewMode.value // when view mode changed - reset day to 1st day in list
    }),
    ({newWeatherForecastDays}) => {
      const currentSelectedDateExists = newWeatherForecastDays?.find(day => day === selectedDate.value)
      if(!currentSelectedDateExists) {
        selectDay(newWeatherForecastDays?.at(0) ?? '');
      }
    },
    {
      immediate: true
    }
  );
</script>

<style lang="scss" scoped>
  .city-weather {
    display: flex;
    flex-direction: column;
    gap: 8px;
    &__header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    &__view-mode {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
