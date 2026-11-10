<template>
  <button
    type="button"
    v-bind="$attrs"
    :class="['btn', `btn--${variant}`, { 'btn--icon': icon }]"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    variant?: 'secondary' | 'primary' | 'danger'
    /** Square 40×40 button holding only an icon. Give it an aria-label. */
    icon?: boolean
  }>(), {
    variant: 'secondary',
    icon: false,
  });
</script>

<style lang="scss" scoped>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: var(--control-height);
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;

    &:hover {
      background: var(--color-bg);
      color: var(--color-text);
    }

    &.active {
      background: var(--color-accent-soft);
      border-color: var(--color-accent);
      color: var(--color-accent);
      font-weight: 600;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: var(--focus-offset);
    }

    &--primary {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-on-accent);
      font-weight: 600;

      &:hover {
        background: var(--color-accent-hover);
        border-color: var(--color-accent-hover);
        color: var(--color-on-accent);
      }
    }

    &--danger {
      background: var(--color-danger);
      border-color: var(--color-danger);
      color: var(--color-on-accent);
      font-weight: 600;

      &:hover {
        background: var(--color-danger);
        color: var(--color-on-accent);
        filter: brightness(0.92);
      }
    }

    &--icon {
      width: var(--control-height);
      height: var(--control-height);
      padding: 0;
      flex: none;
    }

    :deep(.material-icons) {
      font-size: 20px;
    }
  }
</style>
