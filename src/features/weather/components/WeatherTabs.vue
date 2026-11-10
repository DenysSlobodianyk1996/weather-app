<template>
  <div class="tabs">
    <div class="tabs__list" role="tablist" :aria-label="t('viewMode.tabsLabel')">
      <button
        v-for="tab in tabs"
        :key="tab.mode"
        :ref="el => setTabRef(tab.mode, el)"
        :id="tabId(tab.mode)"
        type="button"
        role="tab"
        class="tabs__tab"
        :aria-selected="tab.mode === modelValue"
        :aria-controls="panelId"
        :tabindex="tab.mode === modelValue ? 0 : -1"
        @click="select(tab.mode)"
        @keydown="onKeydown"
      >
        {{ tab.label }}
        <span class="tabs__badge num">{{ tab.count }}</span>
      </button>
    </div>
    <div class="tabs__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, useId } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { WeatherTabMode } from '../models';

  const { t } = useI18n();

  const props = withDefaults(defineProps<{
    modelValue: WeatherTabMode
    mainCount: number
    favoriteCount: number
    /** Prefix for the tab ids; the panel should use `${id}-panel` */
    id?: string
  }>(), {
    id: () => useId(),
  });

  const emit = defineEmits<{
    'update:modelValue': [mode: WeatherTabMode]
  }>();

  const tabs = computed(() => [
    { mode: 'main' as const, label: t('viewMode.main'), count: props.mainCount },
    { mode: 'favorite' as const, label: t('viewMode.favorite'), count: props.favoriteCount },
  ]);

  const tabId = (mode: WeatherTabMode) => `${props.id}-${mode}`;
  const panelId = computed(() => `${props.id}-panel`);

  const tabRefs = new Map<WeatherTabMode, HTMLElement>();
  function setTabRef(mode: WeatherTabMode, el: unknown) {
    if(el instanceof HTMLElement) {
      tabRefs.set(mode, el);
    }
  }

  function select(mode: WeatherTabMode) {
    if(mode !== props.modelValue) {
      emit('update:modelValue', mode);
    }
  }

  // Arrow keys move between tabs, as the ARIA tabs pattern expects.
  function onKeydown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if(!step) {
      return;
    }
    event.preventDefault();
    const index = tabs.value.findIndex(tab => tab.mode === props.modelValue);
    const next = tabs.value[(index + step + tabs.value.length) % tabs.value.length].mode;
    select(next);
    nextTick(() => tabRefs.get(next)?.focus());
  }
</script>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: var(--space-4);
    border-bottom: 1px solid var(--color-border);

    &__list {
      display: flex;
      gap: var(--space-6);
      min-width: 0;
    }

    &__tab {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 10px 2px;
      margin-bottom: -1px;
      background: none;
      border: 0;
      border-bottom: 2px solid transparent;
      color: var(--color-text-muted);
      white-space: nowrap;

      &:hover {
        color: var(--color-text);
      }

      &[aria-selected="true"] {
        border-bottom-color: var(--color-accent);
        color: var(--color-text);
        font-weight: 600;

        .tabs__badge {
          background: var(--color-accent-soft);
          color: var(--color-accent);
        }
      }
    }

    &__badge {
      font-size: var(--font-size-xs);
      font-weight: 500;
      line-height: 1.5;
      padding: 1px var(--space-2);
      border-radius: var(--radius-pill);
      background: var(--color-surface-muted);
      color: var(--color-text-muted);
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-left: auto;
      padding-bottom: var(--space-2);

      &:empty {
        display: none;
      }
    }
  }

  @media (max-width: 599px) {
    .tabs {
      gap: var(--space-1);

      &__list {
        gap: var(--space-3);
      }
    }
  }
</style>
