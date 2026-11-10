<template>
  <div class="city-weather">
    <!--
      One header for every state: the city name (CityDetails, in the cityDetails slot) and the actions stay
      mounted while the forecast loads, fails or arrives, so the name is loaded once and doesn't flicker.
    -->
    <div class="city-weather__header">
      <CurrentConditions :current="loading || error ? null : shaped?.current ?? null">
        <slot name="cityDetails"></slot>
      </CurrentConditions>
      <PillSwitch
        v-if="!error"
        class="city-weather__view-mode"
        v-model="viewMode"
        :label="t('viewMode.label')"
        :options="viewModeOptions"
      />
      <slot name="actions"></slot>
    </div>

    <template v-if="loading">
      <CityCardSkeleton :label="t('cityCard.loadingForecast')" />
    </template>
    <ForecastError v-else-if="error" @retry="emit('retry')" />
    <template v-else-if="shaped">
      <div class="city-weather__forecast">
        <DayWeatherSummary v-if="viewMode === 'day'" :periods="shaped.today.periods" />
        <FiveDayForecast v-else :days="shaped.fiveDays" />
        <TemperatureChart
          :viewMode="viewMode"
          :labels="chartPoints.labels"
          :temperatures="chartPoints.temperatures"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import PillSwitch from '@/components/base/PillSwitch.vue';
  import type { ForecastModel } from '@/models';
  import { useNow } from '@/composables';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { WeatherViewMode } from '../../models';
  import { formatShortDay, shapeForecast } from '../../forecast';
  import CityCardSkeleton from './CityCardSkeleton.vue';
  import CurrentConditions from './CurrentConditions.vue';
  import DayWeatherSummary from './day-weather/DayWeatherSummary.vue'
  import ForecastError from './ForecastError.vue'
  import FiveDayForecast from './FiveDayForecast.vue'
  import TemperatureChart from './TemperatureChart.vue'

  const { t, locale } = useI18n();

  const props = defineProps<{
    forecast: ForecastModel | null,
    loading: boolean
    /** The forecast failed: the error with "Try again" shows instead of it. */
    error?: boolean
  }>();

  const emit = defineEmits<{
    retry: []
  }>();

  // Ticks every minute, so the local clock and "today" move on while the card stays open.
  const now = useNow();

  const shaped = computed(() => props.forecast
    ? shapeForecast(props.forecast.list, props.forecast.timezoneOffset, now.value)
    : null);

  const viewMode = ref<WeatherViewMode>('day');
  const viewModeOptions = computed<{ value: WeatherViewMode; label: string }[]>(() => [
    { value: 'day', label: t('viewMode.day') },
    { value: 'fiveDays', label: t('viewMode.fiveDays') },
  ]);

  const chartPoints = computed(() => {
    if(!shaped.value) {
      return { labels: [], temperatures: [] };
    }
    if(viewMode.value === 'day') {
      // Today's slots at their local times, e.g. "14:00".
      const { slots } = shaped.value.today;
      return {
        labels: slots.map(slot => slot.localTime),
        temperatures: slots.map(slot => slot.main?.temp ?? 0),
      };
    }
    // One bar per Daily average, rounded like the rows show it: "Today", "Wed 12", …
    const days = shaped.value.fiveDays;
    return {
      labels: days.map(day => day.isToday ? t('fiveDays.today') : formatShortDay(day.localTimestamp, locale.value)),
      temperatures: days.map(day => Math.round(day.dailyAverage)),
    };
  });
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

    &__forecast {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      min-width: 0;
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
