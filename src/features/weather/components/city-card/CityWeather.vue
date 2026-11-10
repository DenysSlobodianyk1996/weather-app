<template>
  <div class="city-weather">
    <div class="city-weather__header">
      <CurrentConditions v-if="!loading && shaped?.current" :current="shaped.current">
        <slot name="cityDetails"></slot>
      </CurrentConditions>
      <div v-else class="city-weather__details">
        <slot name="cityDetails"></slot>
      </div>
      <PillSwitch
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
    <template v-else-if="shaped">
      <div class="city-weather__days-list">
        <div v-if="viewMode === 'week'" class="city-weather__days">
          <Button
            v-for="day in shaped.days"
            :key="day.localDate"
            class="city-weather__day num"
            :class="{ active: selectedDay?.localDate === day.localDate }"
            :aria-pressed="selectedDay?.localDate === day.localDate"
            @click="selectedDate = day.localDate">{{ day.localDate }}</Button>
        </div>
        <DayWeatherSummary v-if="selectedDay" :periods="selectedDay.periods" />
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
  import Button from '@/components/base/Button.vue';
  import PillSwitch from '@/components/base/PillSwitch.vue';
  import type { ForecastModel } from '@/models';
  import { useNow } from '@/composables';
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { WeatherViewMode } from '../../models';
  import { shapeForecast, type ForecastSlot } from '../../forecast';
  import CityCardSkeleton from './CityCardSkeleton.vue';
  import CurrentConditions from './CurrentConditions.vue';
  import DayWeatherSummary from './day-weather/DayWeatherSummary.vue'
  import TemperatureChart from './TemperatureChart.vue'

  const { t } = useI18n();

  const props = defineProps<{
    forecast: ForecastModel | null,
    loading: boolean
  }>();

  // Ticks every minute, so the local clock and "today" move on while the card stays open.
  const now = useNow();

  const shaped = computed(() => props.forecast
    ? shapeForecast(props.forecast.list, props.forecast.timezoneOffset, now.value)
    : null);

  const viewMode = ref<WeatherViewMode>('day');
  const viewModeOptions = computed<{ value: WeatherViewMode; label: string }[]>(() => [
    { value: 'day', label: t('viewMode.day') },
    { value: 'week', label: t('viewMode.week') },
  ]);

  /** The local date picked in Week mode. Day view always shows today. */
  const selectedDate = ref('');
  watch(viewMode, () => {
    selectedDate.value = '';
  });

  const selectedDay = computed(() => {
    if(!shaped.value) {
      return null;
    }
    if(viewMode.value === 'day') {
      return shaped.value.today;
    }
    const { days } = shaped.value;
    return days.find(day => day.localDate === selectedDate.value) ?? days[0] ?? null;
  });

  const chartPoints = computed(() => {
    const slots: ForecastSlot[] = viewMode.value === 'day'
      ? shaped.value?.today.slots ?? []
      : shaped.value?.slots ?? [];
    return {
      // Day: "14:00"; Week: "11-10 14:00". Both local.
      labels: slots.map(slot => viewMode.value === 'day'
        ? slot.localTime
        : `${slot.localDate.slice(5)} ${slot.localTime}`),
      temperatures: slots.map(slot => slot.main?.temp ?? 0),
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
