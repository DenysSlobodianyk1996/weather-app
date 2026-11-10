<template>
  <div class="day-weather-summary">
    <table class="day-weather-summary__table num">
      <thead>
        <tr>
          <template v-for="(col, index) in headCols" :key="index">
            <th
              :colspan="col.colspan"
              :class="index === 0 ? 'row-label' : 'period-start'"
              scope="col"
            >
              <template v-if="col.content">
                {{ t(col.content) }}
              </template>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr class="row-muted">
          <th class="row-label" scope="row">{{ t('weather.time') }}</th>
          <td v-for="(timeKey, index) in timeKeys" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            {{ timeKey }}
          </td>
        </tr> <!-- Time-->

        <tr>
          <th class="row-label" scope="row"><span class="sr-only">{{ t('weather.conditions') }}</span></th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.weather?.[0]">
              <DayWeatherIcon :icon="data?.timeForecast?.weather?.[0].icon" :alt="data?.timeForecast?.weather?.[0].description" />
            </template>
          </td>
        </tr> <!-- Weather Icon -->

        <tr class="row-strong">
          <th class="row-label" scope="row">{{ t('weather.temperature') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.main?.temp">
              {{ data.timeForecast.main.temp }}&nbsp;&deg;C
            </template>
          </td>
        </tr> <!-- Temperature -->

        <tr>
          <th class="row-label" scope="row">{{ t('weather.feelsLike') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.main?.feels_like">
              {{ data.timeForecast.main.feels_like }}&nbsp;&deg;C
            </template>
          </td>
        </tr> <!-- Feels Like -->

        <tr>
          <th class="row-label" scope="row">{{ t('weather.pressure') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.main?.pressure">
              {{ data.timeForecast.main.pressure }}&nbsp;hPa
            </template>
          </td>
        </tr> <!-- Pressure -->

        <tr>
          <th class="row-label" scope="row">{{ t('weather.humidity') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.main?.humidity">
              {{ data.timeForecast.main.humidity }}&nbsp;&percnt;
            </template>
          </td>
        </tr> <!-- Humidity -->

        <tr>
          <th class="row-label" scope="row">{{ t('weather.windSpeed') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.wind">
              <p>{{ data.timeForecast.wind.deg }}&deg;&nbsp;{{ t('weather.directionDeg') }}</p>
              <p>{{ data.timeForecast.wind.speed }}&nbsp;(m/s)</p>
            </template>
          </td>
        </tr> <!-- Wind speed -->

        <tr>
          <th class="row-label" scope="row">{{ t('weather.visibility') }}</th>
          <td v-for="(data, index) in timeKeysForecastData" :key="index" :class="{ 'period-start': index % 2 === 0 }">
            <template v-if="data?.timeForecast?.visibility">
              {{ data.timeForecast.visibility }}&nbsp;{{ t('weather.meters') }}
            </template>
          </td>
        </tr> <!-- Visibility -->
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import type { WeatherList } from '@/models';
  import { computed, toRefs } from 'vue';
  import DayWeatherIcon from './DayWeatherIcon.vue'
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    selectedDateWeatherForecast: WeatherList[]
  }>();
  const { selectedDateWeatherForecast } = toRefs(props);

  const headCols = [
    { content: '', colspan: 1, time: [] }, // Description
    { content: 'dayTime.night', colspan: 2, time: ['00:00', '03:00'] },
    { content: 'dayTime.morning', colspan: 2, time: ['06:00', '09:00'] },
    { content: 'dayTime.day', colspan: 2, time: ['12:00', '15:00'] },
    { content: 'dayTime.evening', colspan: 2, time: ['18:00', '21:00'] },
  ];

  const timeKeys = headCols.flatMap(item => item.time);
  const timeKeysForecastData = computed(() => {
    const currentSelectedDateWeatherForecast = selectedDateWeatherForecast.value;
    return timeKeys.map(timeItem => {
      const timeForecast = currentSelectedDateWeatherForecast.find(forecast => forecast.dt_txt_time?.startsWith(timeItem));
      return {
        time: timeItem,
        timeForecast
      };
    });
  }); // array with lenght 8 always (timeKeys.lenght)

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
