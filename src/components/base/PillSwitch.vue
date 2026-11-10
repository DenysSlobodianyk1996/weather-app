<template>
  <div class="pill-switch" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="pill-switch__option"
      :aria-pressed="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >{{ option.label }}</button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
  defineProps<{
    modelValue: T
    options: { value: T; label: string }[]
    /** Accessible name for the group */
    label: string
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: T]
  }>();
</script>

<style lang="scss" scoped>
  .pill-switch {
    display: inline-flex;
    padding: 3px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);

    &__option {
      flex: 1 1 0;
      padding: 6px 18px;
      border: 0;
      border-radius: var(--radius-pill);
      background: none;
      color: var(--color-text-muted);
      white-space: nowrap;

      &:hover {
        color: var(--color-text);
      }

      &[aria-pressed="true"] {
        background: var(--color-accent);
        color: var(--color-on-accent);
        font-weight: 600;
      }
    }
  }
</style>
