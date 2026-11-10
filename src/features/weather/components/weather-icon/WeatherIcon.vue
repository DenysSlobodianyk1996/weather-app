<template>
  <svg
    class="weather-icon"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :role="description ? 'img' : undefined"
    :aria-label="description || undefined"
    :aria-hidden="description ? undefined : 'true'"
  >
    <template v-for="(shape, index) in shapes" :key="index">
      <circle v-if="shape.tag === 'circle'" v-bind="shape.attrs" :style="shape.style" />
      <path v-else v-bind="shape.attrs" :style="shape.style" />
    </template>
  </svg>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue'
  import {
    WEATHER_ICON_ART,
    WEATHER_ICON_COLOR_TOKENS,
    strokeBoost,
    weatherIconName,
    type WeatherIconColor,
  } from './weather-icons'

  const props = withDefaults(defineProps<{
    /** OpenWeatherMap icon code, for example `10d`. Unknown codes show the 03d icon. */
    code: string
    /** Weather description; the icon's accessible name. Empty means decorative. */
    description: string
    /** Width and height in px (64 current conditions, 32 5-day rows, 28 Day table). */
    size?: number
  }>(), {
    size: 64,
  })

  const color = (name: WeatherIconColor) => `var(${WEATHER_ICON_COLOR_TOKENS[name]})`

  const shapes = computed(() => {
    const boost = strokeBoost(props.size)

    return WEATHER_ICON_ART[weatherIconName(props.code)].map((shape) => {
      const style: CSSProperties = { fill: shape.fill ? color(shape.fill) : 'none' }
      if (shape.stroke) {
        style.stroke = color(shape.stroke)
        style.strokeWidth = (shape.strokeWidth ?? 0) + boost
        style.strokeLinejoin = 'round'
        if (shape.roundCaps) style.strokeLinecap = 'round'
      }
      return { tag: shape.tag, attrs: shape.attrs, style }
    })
  })
</script>

<style lang="scss" scoped>
  .weather-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
  }
</style>
