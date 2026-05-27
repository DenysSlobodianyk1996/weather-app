<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
  import Chart from 'chart.js/auto';
  import { computed, onMounted, toRefs, useTemplateRef, watch } from 'vue';
  import type { WeatherViewMode } from '../../models';
  import type { WeatherList } from '@/models';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    selectedDate: string,
    viewMode: WeatherViewMode,
    weather5Days3HoursForecast: WeatherList[] | null,
  }>();
  const {
    selectedDate,
    viewMode,
    weather5Days3HoursForecast
  } = toRefs(props);

  let chartObj: Chart | null = null;
  const canvasRef = useTemplateRef('chartCanvas');
  const chartContext = computed(() => canvasRef.value?.getContext('2d')!)

  const selectedDateWeatherForecast = computed(() => {
    const currentSelectedDate = selectedDate.value;
    return weather5Days3HoursForecast.value?.filter(item => item.dt_txt_day === currentSelectedDate);
  });

  const chartData = computed(() => {
    const chartItems = viewMode.value === 'week'
      ? weather5Days3HoursForecast.value
      : selectedDateWeatherForecast.value;

    return {
      labels: chartItems?.map(({dt_txt}) => dt_txt) || [],
      datasets: [
        {
          label: t('weather.temperature'),
          data: chartItems?.map(({main}) => {
            return main?.temp ?? 0
          }) ?? []
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
  .chart-wrapper {
    width: 100%;
    height: 400px;
    margin-top: 16px;
  }
</style>