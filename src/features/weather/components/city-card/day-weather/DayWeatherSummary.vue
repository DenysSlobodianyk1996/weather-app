<template>
  <div class="day-weather-summary">
    <table class="day-weather-summary__table num">
      <thead>
        <tr>
          <th class="row-label" scope="col"></th>
          <th
            v-for="period in periods"
            :key="period.name"
            :colspan="period.columns.length"
            class="period-start"
            scope="colgroup"
          >{{ t(`dayTime.${period.name}`) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="row-muted">
          <th class="row-label" scope="row">{{ t('weather.time') }}</th>
          <td v-for="(column, index) in columns" :key="index" :class="{ 'period-start': column.periodStart }">
            {{ column.localTime }}
          </td>
        </tr>

        <tr>
          <th class="row-label" scope="row"><span class="sr-only">{{ t('weather.conditions') }}</span></th>
          <td v-for="(column, index) in columns" :key="index" :class="{ 'period-start': column.periodStart }">
            <WeatherIcon
              v-if="column.slot?.weather?.[0]"
              :code="column.slot.weather[0].icon"
              :description="column.slot.weather[0].description"
              :size="28"
            />
          </td>
        </tr>

        <tr v-for="row in rows" :key="row.label" :class="row.className">
          <th class="row-label" scope="row">{{ row.label }}</th>
          <td v-for="(column, index) in columns" :key="index" :class="{ 'period-start': column.periodStart }">
            <template v-if="column.slot">{{ row.value(column.slot) }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import WeatherIcon from '../../weather-icon/WeatherIcon.vue'
  import { compassPoint, formatTemperature, type DayPeriod, type ForecastSlot } from '../../../forecast';

  const { t, locale } = useI18n();

  const props = defineProps<{
    /** One local day, as `shapeForecast` groups it. */
    periods: DayPeriod[]
  }>();

  const columns = computed(() => props.periods.flatMap(period =>
    period.columns.map((column, index) => ({ ...column, periodStart: index === 0 }))));

  const number = (value: number, maximumFractionDigits: number) =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits }).format(value);

  // Readings are checked against null, never truthiness, so 0 is shown.
  const rows = computed<{ label: string; className?: string; value: (slot: ForecastSlot) => string }[]>(() => [
    {
      label: t('weather.temperature'),
      className: 'row-strong',
      value: slot => slot.main?.temp == null ? '' : formatTemperature(slot.main.temp),
    },
    {
      label: t('weather.feelsLike'),
      value: slot => slot.main?.feels_like == null ? '' : formatTemperature(slot.main.feels_like),
    },
    {
      label: t('weather.humidity'),
      value: slot => slot.main?.humidity == null ? '' : `${slot.main.humidity}%`,
    },
    {
      label: t('weather.wind'),
      value: slot => slot.wind?.speed == null
        ? ''
        : `${slot.wind.deg == null ? '' : `${t(`compass.${compassPoint(slot.wind.deg)}`)} `}`
          + `${number(slot.wind.speed, 1)} ${t('units.metersPerSecond')}`,
    },
    {
      label: t('weather.pressure'),
      value: slot => slot.main?.pressure == null ? '' : `${Math.round(slot.main.pressure)} ${t('units.hectopascals')}`,
    },
    {
      label: t('weather.visibility'),
      value: slot => slot.visibility == null ? '' : `${number(slot.visibility / 1000, 1)} ${t('units.kilometers')}`,
    },
  ]);
</script>

<style lang="scss" scoped>
  // The wrapper scrolls sideways; the first column (row labels) stays pinned.
  .day-weather-summary {
    overflow-x: auto;
    max-width: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);

    &__table {
      width: 100%;
      min-width: 760px;
      border-collapse: collapse;
      font-size: var(--font-size-md);
    }

    th,
    td {
      padding: var(--space-2);
      text-align: center;
      border-bottom: 1px solid var(--color-border-subtle);
    }

    thead th {
      padding: 10px;
      background: var(--color-bg);
      font-weight: 600;
      border-bottom-color: var(--color-border);
    }

    tbody tr:last-child > * {
      border-bottom: 0;
    }

    .period-start {
      border-left: 1px solid var(--color-border);
    }

    .row-label {
      position: sticky;
      left: 0;
      z-index: 1;
      padding: var(--space-2) 14px;
      text-align: left;
      font-weight: 400;
      white-space: nowrap;
      color: var(--color-text-muted);
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
    }

    thead .row-label {
      background: var(--color-bg);
    }

    .row-muted td {
      color: var(--color-text-muted);
    }

    .row-strong td {
      font-weight: 600;
    }
  }

  @media (max-width: 599px) {
    .day-weather-summary__table {
      min-width: 640px;
    }

    .day-weather-summary .row-label {
      padding: var(--space-2) var(--space-3);
    }
  }
</style>
