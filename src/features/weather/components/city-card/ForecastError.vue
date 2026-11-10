<template>
  <div class="forecast-error" role="alert">
    <div class="forecast-error__message">
      <span class="material-icons forecast-error__icon" aria-hidden="true">error_outline</span>
      <div class="forecast-error__text">
        <span class="forecast-error__title">{{ t('cityCard.forecastFailed') }}</span>
        <span class="forecast-error__hint">{{ t('cityCard.forecastFailedHint') }}</span>
      </div>
    </div>
    <Button class="forecast-error__retry" @click="emit('retry')">
      <span class="material-icons" aria-hidden="true">refresh</span>
      {{ t('cityCard.tryAgain') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import Button from '@/components/base/Button.vue';

  const { t } = useI18n();

  const emit = defineEmits<{
    retry: []
  }>();
</script>

<style lang="scss" scoped>
  .forecast-error {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: var(--space-4);
    background: var(--color-danger-soft);
    border: 1px solid var(--color-danger-border);
    border-radius: var(--radius-lg);

    &__message {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    &__icon {
      flex: none;
      margin-top: 2px;
      font-size: 20px;
      color: var(--color-danger);
    }

    &__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__title {
      font-weight: 600;
      color: var(--color-danger-text);
    }

    &__hint {
      font-size: var(--font-size-md);
      color: var(--color-text-muted);
    }

    // Two classes so this wins over the base Button styles.
    & &__retry {
      align-self: flex-start;
      min-height: 36px;
      color: var(--color-text);
      font-weight: 600;

      .material-icons {
        font-size: 16px;
      }
    }
  }
</style>
