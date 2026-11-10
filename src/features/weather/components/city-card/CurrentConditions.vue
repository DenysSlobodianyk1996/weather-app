<template>
  <div class="current-conditions">
    <WeatherIcon
      v-if="current && weather"
      :code="weather.icon"
      :description="weather.description"
      :size="64"
    />
    <span v-if="current" class="current-conditions__temperature num">{{ formatTemperature(current.slot.main.temp) }}</span>
    <div class="current-conditions__text">
      <!-- The city name. -->
      <slot></slot>
      <span v-if="current" class="current-conditions__summary">
        <template v-if="weather">{{ weather.description }} · </template>{{ t('weather.feelsLikeValue', { value: formatTemperature(current.slot.main.feels_like) }) }}
      </span>
      <span v-if="current" class="current-conditions__time num">
        {{ formatLocalDate(current.localTimestamp, locale) }} · {{ t('weather.localTime', { time: formatLocalTime(current.localTimestamp) }) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import WeatherIcon from '../weather-icon/WeatherIcon.vue';
  import {
    formatLocalDate,
    formatLocalTime,
    formatTemperature,
    type CurrentConditions,
  } from '../../forecast';

  const { t, locale } = useI18n();

  const props = defineProps<{
    /** Null while the forecast loads or after it failed: only the city name shows. */
    current: CurrentConditions | null
  }>();

  const weather = computed(() => props.current?.slot.weather?.[0]);
</script>

<style lang="scss" scoped>
  .current-conditions {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    min-width: 0;

    &__temperature {
      font-size: 52px;
      font-weight: 600;
      line-height: 1;
    }

    &__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    &__summary {
      color: var(--color-text-muted);

      &::first-letter {
        text-transform: uppercase;
      }
    }

    &__time {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  }

  @media (max-width: 599px) {
    .current-conditions {
      gap: var(--space-3) var(--space-4);

      &__temperature {
        font-size: 44px;
      }

      &__summary {
        font-size: var(--font-size-md);
      }
    }
  }
</style>
