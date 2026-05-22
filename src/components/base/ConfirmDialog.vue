<template>
  <slot
    name="dialogActivator"
    :props="activatorProps"
  ></slot>

  <dialog :id="id" ref="dialog">
    <slot name="dialogContent"></slot>
    <div class="dialog-actions">
      <Button @click="closeDialog">Cancel</Button>
      <Button @click="emit('confirm'); closeDialog">Confirm</Button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { computed, useTemplateRef } from 'vue';
  import Button from './Button.vue';

  const props = defineProps<{
    id: string
  }>()
  const id = computed(() => props.id);

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
    min-width: 200px;
    min-height: 50px;
    border: unset;
    border-radius: 4px;
    padding: 24px;
    flex-direction: column;
    gap: 16px;
    &[open] {
      display: flex;
    }

    &::backdrop {
      background-color: rgba($color: #000000, $alpha: .4);
    }
  }

  .dialog-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
</style>
