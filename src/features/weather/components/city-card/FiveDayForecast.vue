<template>
  <ol class="five-day-forecast num" :aria-label="t('fiveDays.label')">
    <li v-for="day in days" :key="day.localDate" class="five-day-forecast__row">
      <span class="five-day-forecast__day"><b>{{ day.isToday ? t('fiveDays.today') : formatWeekday(day.localTimestamp, locale) }}</b> <span class="five-day-forecast__date">{{ formatDayMonth(day.localTimestamp, locale) }}</span></span>
      <WeatherIcon
        class="five-day-forecast__icon"
        :code="day.middaySlot.weather?.[0]?.icon ?? ''"
        :description="day.middaySlot.weather?.[0]?.description ?? ''"
        :size="32"
      />
      <span class="five-day-forecast__description">{{ day.middaySlot.weather?.[0]?.description }}</span>
      <span class="five-day-forecast__average">{{ formatTemperature(day.dailyAverage) }}</span>
      <!-- Reads "Low 1° high 5°" to a screen reader. -->
      <span class="five-day-forecast__range"><span><span class="sr-only">{{ `${t('fiveDays.low')} ` }}</span><span aria-hidden="true">↓ </span>{{ formatTemperature(day.low) }}</span> <span><span class="sr-only">{{ `${t('fiveDays.high')} ` }}</span><span aria-hidden="true">↑ </span>{{ formatTemperature(day.high) }}</span></span>
    </li>
  </ol>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import WeatherIcon from '../weather-icon/WeatherIcon.vue';
  import {
    formatDayMonth,
    formatTemperature,
    formatWeekday,
    type DailyForecast,
  } from '../../forecast';

  const { t, locale } = useI18n();

  defineProps<{
    /** Today and the next 4 local days. */
    days: DailyForecast[]
  }>();
</script>

<style lang="scss" scoped>
  .five-day-forecast {
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);

    &__row {
      display: grid;
      grid-template-columns: 140px 40px minmax(0, 1fr) 72px 110px;
      grid-template-areas: 'day icon description average range';
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border-subtle);

      &:last-child {
        border-bottom: 0;
      }
    }

    &__day {
      grid-area: day;
    }

    &__date,
    &__description,
    &__range {
      color: var(--color-text-muted);
    }

    &__icon {
      grid-area: icon;
    }

    &__description {
      grid-area: description;
      min-width: 0;

      &::first-letter {
        text-transform: uppercase;
      }
    }

    &__average {
      grid-area: average;
      font-size: 20px;
      font-weight: 600;
      text-align: right;
    }

    &__range {
      grid-area: range;
      display: flex;
      gap: var(--space-3);
      white-space: nowrap;
    }
  }

  // At phone width each day takes two lines: icon, day and average on top, description and low/high below.
  @media (max-width: 599px) {
    .five-day-forecast__row {
      grid-template-columns: 32px minmax(0, 1fr) auto;
      grid-template-areas:
        'icon day average'
        'icon description range';
      gap: 2px var(--space-3);
      padding: 10px var(--space-3);
    }

    .five-day-forecast__description,
    .five-day-forecast__range {
      font-size: var(--font-size-md);
    }

    .five-day-forecast__range {
      justify-content: flex-end;
    }
  }
</style>
