<template>
  <div class="city-weather">
    <div class="city-weather__header">
      <div class="city-weather__details">
        <slot name="cityDetails"></slot>
      </div>
      <PillSwitch
        class="city-weather__view-mode"
        v-model="viewMode"
        :label="t('viewMode.label')"
        :options="viewModeOptions"
      />
    </div>

    <template v-if="weather5Days3HoursForecastLoading">
      <CityCardSkeleton :label="t('cityCard.loadingForecast')" />
    </template>
    <template v-else>
      <div class="city-weather__days-list">
        <div class="city-weather__days">
          <template v-if="viewMode === 'day'">
            <span class="city-weather__date num">{{ selectedDate }}</span>
          </template>
          <template v-else>
            <template v-for="day in weatherForecastDays" :key="day">
              <Button
                class="city-weather__day num"
                :class="{
                  active: selectedDate === day
                }"
                :aria-pressed="selectedDate === day"
                @click="selectDay(day)">{{ day }}</Button>
            </template>
          </template>
        </div>
        <template v-if="selectedDateWeatherForecast.length">
          <DayWeatherSummary :selectedDateWeatherForecast="selectedDateWeatherForecast" />
        </template>
        <TemperatureChart
          :selectedDate="selectedDate"  
          :viewMode="viewMode"
          :weather5Days3HoursForecast="weather5Days3HoursForecast"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import Button from '@/components/base/Button.vue';
  import { computed, ref, toRefs, watch } from 'vue';
  import type { WeatherViewMode } from '../../models';
  import type { WeatherList } from '@/models';
  import DayWeatherSummary from './day-weather/DayWeatherSummary.vue'
  import TemperatureChart from './TemperatureChart.vue'
  import CityCardSkeleton from './CityCardSkeleton.vue';
  import PillSwitch from '@/components/base/PillSwitch.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    weather5Days3HoursForecast: WeatherList[] | null,
    weather5Days3HoursForecastLoading: boolean
  }>();
  const {
    weather5Days3HoursForecast,
    weather5Days3HoursForecastLoading
  } = toRefs(props);

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
  const viewModeOptions = computed<{ value: WeatherViewMode; label: string }[]>(() => [
    { value: 'day', label: t('viewMode.day') },
    { value: 'week', label: t('viewMode.week') },
  ]);
  const selectedDate = ref<string>('');

  const selectedDateWeatherForecast = computed<WeatherList[]>(() => {
    const currentSelectedDate = selectedDate.value;
    const currentWeatherForecastGroupByDays = weatherForecastGroupByDays.value;
    if(!currentSelectedDate || !currentWeatherForecastGroupByDays) {
      return []
    }
    return currentWeatherForecastGroupByDays[currentSelectedDate] ?? [];
  });

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
    gap: var(--space-5);
    min-width: 0;

    &__header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4) var(--space-5);
    }

    &__details {
      flex: 1 1 auto;
      min-width: 0;
    }

    &__days-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      min-width: 0;
    }

    &__days {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    &__date {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    // Two classes so these win over the base Button padding.
    &__days &__day {
      min-height: 32px;
      padding: 0 var(--space-3);
      font-size: var(--font-size-md);
    }
  }

  @media (max-width: 599px) {
    .city-weather {
      gap: var(--space-4);

      &__view-mode {
        flex-basis: 100%;
      }
    }
  }
</style>
