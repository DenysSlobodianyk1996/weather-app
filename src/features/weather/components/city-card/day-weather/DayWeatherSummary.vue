<template>
  <div class="day-weather-summary">
    <div class="day-weather-summary__table-wrapper">
      <table>
        <thead>
          <template v-for="(col, index) in headCols" :key="index">
            <th :colspan="col.colspan">
              <template v-if="col.content">
                {{ t(col.content) }}
              </template>
            </th>
          </template>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td v-for="(timeKey, index) in timeKeys" :key="index">
              {{ timeKey }}
            </td>
          </tr> <!-- Time-->

          <tr>
            <td></td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.weather?.[0]">
                <DayWeatherIcon :icon="data?.timeForecast?.weather?.[0].icon" :alt="data?.timeForecast?.weather?.[0].description" />
              </template>
            </td>
          </tr> <!-- Weather Icon -->

          <tr>
            <td>{{ t('weather.temperature') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.temp">
                <p>{{ data.timeForecast.main.temp }}&nbsp;&deg;C</p>
              </template>
            </td>
          </tr> <!-- Temperature -->

          <tr>
            <td>{{ t('weather.fillsLike') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.feels_like">
                <p>{{ data.timeForecast.main.feels_like }}&nbsp;&deg;C</p>
              </template>
            </td>
          </tr> <!-- Fills Like -->

          <tr>
            <td>{{ t('weather.pressure') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.pressure">
                <p>{{ data.timeForecast.main.pressure }}&nbsp;hPa</p>
              </template>
            </td>
          </tr> <!-- Pressure -->

          <tr>
            <td>{{ t('weather.humidity') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.humidity">
                <p>{{ data.timeForecast.main.humidity }}&nbsp;&percnt;</p>
              </template>
            </td>
          </tr> <!-- Humidity -->

          <tr>
            <td>{{ t('weather.windSpeed') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.wind">
                <p>{{ data.timeForecast.wind.deg }}&deg;&nbsp;{{ t('weather.directionDeg') }}</p>
                <p>{{ data.timeForecast.wind.speed }}&nbsp;(m/s)</p>
              </template>
            </td>
          </tr> <!-- Wind speed -->

          <tr>
            <td>{{ t('weather.visibility') }}</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.visibility">
                <p>{{ data.timeForecast.visibility }}&nbsp;{{ t('weather.meters') }}</p>
              </template>
            </td>
          </tr> <!-- Wind visibility -->
        </tbody>
      </table>
    </div>
    <div class="day-weather-summary__chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WeatherList } from '@/models';
  import { computed, onMounted, useTemplateRef, watch } from 'vue';
  import DayWeatherIcon from './DayWeatherIcon.vue'
  import Chart from 'chart.js/auto';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    selectedDateWeatherForecast: WeatherList[]
  }>();
  const selectedDateWeatherForecast = computed(() => props.selectedDateWeatherForecast);

  let chartObj: Chart | null = null;
  const canvasRef = useTemplateRef('chartCanvas');
  const chartContext = computed(() => canvasRef.value?.getContext('2d')!)

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

  const chartData = computed(() => {
    const currentTimeKeysForecastData = timeKeysForecastData.value;
    return {
      labels: currentTimeKeysForecastData?.map(({time}) => time),
      datasets: [
        {
          label: t('weather.temperature'),
          data: currentTimeKeysForecastData.map(({ timeForecast }) => {
            
            return !timeForecast
              ? 0
              : timeForecast?.main?.temp ?? 0
          })
        }
      ]
    }
  });

  onMounted(() => {
    chartObj = new Chart(
      chartContext.value,
      {
        type: 'bar',
        data: chartData.value,
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} °C`
                }
              }
            }
          }
        }
      }
    );
  });

  watch(
    () => chartData.value,
    (newChartData) => {
      if(!chartObj || !newChartData) {
        return;
      }
      const { labels, datasets  } = newChartData;
      chartObj!.data.datasets = datasets;
      chartObj!.data.labels = labels;
      chartObj!.update();
    },
  );
</script>

<style lang="scss" scoped>
  .day-weather-summary {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;

    &__table-wrapper {
      overflow-x: auto;
      max-width: 100%;
      table {
        width: 100%;
        th, td {
          text-align: center;
          border-bottom: 1px solid rgba(#ddd, .8);
          &:not(:last-child) {
            border-right: 1px solid rgba(#ddd, .8);
          }
        }
      }
    }

    &__chart-wrapper {
      width: 100%;
      height: 200px;
    }
  }
</style>