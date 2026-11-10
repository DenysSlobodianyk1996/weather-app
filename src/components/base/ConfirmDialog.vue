<template>
  <slot
    name="dialogActivator"
    :props="activatorProps"
  ></slot>

  <dialog :id="id" ref="dialog">
    <slot name="dialogContent"></slot>
    <div class="dialog-actions">
      <Button @click="closeDialog">{{ t('dialog.cancel') }}</Button>
      <Button variant="primary" @click="emit('confirm'); closeDialog">{{ t('dialog.confirm') }}</Button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { toRefs, useTemplateRef } from 'vue';
  import Button from './Button.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{
    id: string
  }>();
  const { id } = toRefs(props);

  const emit = defineEmits<{
    confirm: []
  }>()

  const dialogRef = useTemplateRef('dialog');

  const activatorProps = {
    onClick: () => {
      dialogRef.value?.showModal();
    }
  }

  function closeDialog() {
    dialogRef.value?.close()
  }
</script>

<style lang="scss" scoped>
  dialog {
    width: min(440px, calc(100vw - 2 * var(--page-gutter)));
    border: 0;
    border-radius: var(--radius-dialog);
    padding: var(--space-6);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-dialog);
    flex-direction: column;
    gap: var(--space-4);
    &[open] {
      display: flex;
    }

    &::backdrop {
      background-color: var(--color-backdrop);
    }

    :deep(h3) {
      font-size: var(--font-size-lg);
      font-weight: 600;
    }
  }

  .dialog-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
    flex-wrap: wrap;
  }
</style>
