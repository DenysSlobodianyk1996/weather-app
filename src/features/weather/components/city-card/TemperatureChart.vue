<template>
  <figure class="temperature-chart">
    <figcaption class="temperature-chart__caption">{{ caption }}</figcaption>
    <div class="temperature-chart__canvas">
      <canvas ref="chartCanvas" role="img" :aria-label="caption"></canvas>
    </div>
  </figure>
</template>

<script setup lang="ts">
  import Chart from 'chart.js/auto';
  import { computed, onBeforeUnmount, onMounted, toRefs, useTemplateRef, watch } from 'vue';
  import type { WeatherViewMode } from '../../models';
  import { useI18n } from 'vue-i18n';
  import { cssVar } from '@/utils';

  const { t } = useI18n();

  const props = defineProps<{
    viewMode: WeatherViewMode,
    /** One per point, in the Location's local time. */
    labels: string[],
    /** °C, one per label. */
    temperatures: number[],
  }>();
  const {
    viewMode,
    labels: chartLabels,
    temperatures: chartTemperatures,
  } = toRefs(props);

  const caption = computed(() => viewMode.value === 'day'
    ? t('weather.temperatureTodayChart')
    : t('weather.temperatureChart'));

  /** From this temperature (°C) up, points and bars use the warm colour of the soft scale. */
  const WARM_FROM_CELSIUS = 10;

  let chartObj: Chart | null = null;
  const canvasRef = useTemplateRef('chartCanvas');

  function temperatureColors(temperatures: number[]) {
    const cool = cssVar('--color-temp-cool');
    const warm = cssVar('--color-temp-warm');
    return temperatures.map(temp => temp >= WARM_FROM_CELSIUS ? warm : cool);
  }

  function buildDataset(temperatures: number[]) {
    const scale = temperatureColors(temperatures);
    const label = t('weather.temperature');
    if(viewMode.value === 'week') {
      return {
        label,
        data: temperatures,
        backgroundColor: scale,
        borderRadius: 6,
      };
    }
    return {
      label,
      data: temperatures,
      fill: true,
      borderColor: cssVar('--color-accent'),
      backgroundColor: cssVar('--color-accent-fill'),
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 6,
      pointBackgroundColor: scale,
      pointBorderColor: cssVar('--color-surface'),
      pointBorderWidth: 2,
    };
  }

  function createChart() {
    const context = canvasRef.value?.getContext('2d');
    if(!context) {
      return;
    }
    const muted = cssVar('--color-text-muted');
    const gridColor = cssVar('--color-border-subtle');
    const font = { family: cssVar('--font-sans'), size: 12 };

    chartObj = new Chart(context, {
      type: viewMode.value === 'week' ? 'bar' : 'line',
      data: {
        labels: chartLabels.value,
        datasets: [buildDataset(chartTemperatures.value)],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            border: { color: cssVar('--color-border') },
            ticks: { color: muted, font },
          },
          y: {
            // Whole degrees with a little head- and foot-room, so small ranges don't get float ticks.
            grace: 1,
            grid: { color: gridColor },
            border: { display: false },
            ticks: { color: muted, font, precision: 0, callback: value => `${value}°` },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cssVar('--color-text'),
            titleFont: font,
            bodyFont: font,
            callbacks: {
              label: context => `${context.parsed.y} °C`
            }
          }
        }
      }
    });
  }

  function sameItems<T>(a: readonly T[], b: readonly T[]) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }

  function destroyChart() {
    chartObj?.destroy();
    chartObj = null;
  }

  onMounted(createChart);
  onBeforeUnmount(destroyChart);

  // Day view is a filled line and Week view is bars, so a mode change rebuilds the chart.
  watch(viewMode, () => {
    destroyChart();
    createChart();
  });

  watch(
    () => [chartLabels.value, chartTemperatures.value] as const,
    ([labels, temperatures], [oldLabels, oldTemperatures]) => {
      // The card reshapes its forecast every minute; only redraw when the points really changed.
      if(!chartObj || (sameItems(labels, oldLabels) && sameItems(temperatures, oldTemperatures))) {
        return;
      }
      chartObj.data.labels = labels;
      chartObj.data.datasets = [buildDataset(temperatures)];
      chartObj.update();
    },
  );
</script>

<style lang="scss" scoped>
  .temperature-chart {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;

    &__caption {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-muted);
    }

    &__canvas {
      position: relative;
      width: 100%;
      height: 260px;
    }
  }

  @media (max-width: 599px) {
    .temperature-chart__canvas {
      height: 220px;
    }
  }
</style>
