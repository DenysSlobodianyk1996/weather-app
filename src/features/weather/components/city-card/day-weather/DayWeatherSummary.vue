<template>
  <div class="day-weather-summary">
    <div class="day-weather-summary__table-wrapper">
      <table>
        <thead>
          <template v-for="(col, index) in headCols" :key="index">
            <th :colspan="col.colspan">
              {{ col.content }}
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
            <td>Temperature</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.temp">
                <p>{{ data.timeForecast.main.temp }}&nbsp;&deg;C</p>
              </template>
            </td>
          </tr> <!-- Temperature -->

          <tr>
            <td>Fills like</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.feels_like">
                <p>{{ data.timeForecast.main.feels_like }}&nbsp;&deg;C</p>
              </template>
            </td>
          </tr> <!-- Fills Like -->

          <tr>
            <td>Pressure</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.pressure">
                <p>{{ data.timeForecast.main.pressure }}&nbsp;hPa</p>
              </template>
            </td>
          </tr> <!-- Pressure -->

          <tr>
            <td>Humidity</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.main?.humidity">
                <p>{{ data.timeForecast.main.humidity }}&nbsp;&percnt;</p>
              </template>
            </td>
          </tr> <!-- Humidity -->


          <tr>
            <td>Wind speed</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.wind">
                <p>{{ data.timeForecast.wind.deg }}&deg;&nbsp;direction</p>
                <p>{{ data.timeForecast.wind.speed }}&nbsp;(m/s)</p>
              </template>
            </td>
          </tr> <!-- Wind -->

          <tr>
            <td>Visibility</td>
            <td v-for="(data, index) in timeKeysForecastData" :key="index">
              <template v-if="data?.timeForecast?.visibility">
                <p>{{ data.timeForecast.visibility }}&nbsp;meters</p>
              </template>
            </td>
          </tr> <!-- Wind speed -->
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
  import { computed, onMounted, ref, useTemplateRef, watch, nextTick } from 'vue';
  import DayWeatherIcon from './DayWeatherIcon.vue'
  import Chart from 'chart.js/auto';
import { debounce } from '@/utils';

  const props = defineProps<{
    selectedDateWeatherForecast: WeatherList[]
  }>();
  const selectedDateWeatherForecast = computed(() => props.selectedDateWeatherForecast);

  const canvasRef = useTemplateRef('chartCanvas');

  const chartObj = ref<Chart | null>();

  const headCols = [
    { content: '', colspan: 1, time: [] }, // Description
    { content: 'Night', colspan: 2, time: ['00:00', '03:00'] },
    { content: 'Morning', colspan: 2, time: ['06:00', '09:00'] },
    { content: 'Day', colspan: 2, time: ['12:00', '15:00'] },
    { content: 'Evening', colspan: 2, time: ['18:00', '21:00'] },
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

  function generateBarChartData(timeKeysForecastData: {
      time: string;
      timeForecast?: WeatherList;
  }[]) {
    return {
      labels: timeKeysForecastData.map(({time}) => time),
      datasets: [
        {
          label: 'Temperature by time',
          data: timeKeysForecastData.map(({ timeForecast }) => {
            return !timeForecast
              ? 0
              : timeForecast.main.temp
          })
        }
      ]
    }
  }

  onMounted(() => {
    chartObj.value = new Chart(
      canvasRef.value!,
      {
        type: 'bar',
        data: generateBarChartData(timeKeysForecastData.value)
      }
    );
  });


  const createChart = debounce(async (newTimeKeysForecastData) => {
    await nextTick()

    const { datasets, labels } = generateBarChartData(newTimeKeysForecastData);
    
    chartObj.value!.data.datasets = datasets;
    chartObj.value!.data.labels = labels;

    chartObj.value!.update()
    await nextTick()
  }, 250)

  watch(
    () => timeKeysForecastData.value,
    async newTimeKeysForecastData => {
      await createChart(newTimeKeysForecastData)
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
          &:not(:empty) {
            border: 1px solid;
          }
        }
      }
    }

    &__chart-wrapper {
      width: 100%;
      canvas {
        width: 100%;
      }
    }

  }
</style>