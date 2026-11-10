<template>
  <slot
    name="dialogActivator"
    :props="activatorProps"
  ></slot>

  <Modal v-model:open="open">
    <template #title><slot name="title"></slot></template>
    <slot></slot>
    <template #actions>
      <Button @click="open = false">{{ t('dialog.cancel') }}</Button>
      <Button :variant="danger ? 'danger' : 'primary'" @click="confirm">
        {{ confirmLabel ?? t('dialog.confirm') }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Button from './Button.vue';
  import Modal from './Modal.vue';

  const { t } = useI18n();

  defineProps<{
    /** Text of the confirm button. Defaults to "Confirm". */
    confirmLabel?: string
    /** The confirmed action destroys something, so the confirm button is red. */
    danger?: boolean
  }>();

  const emit = defineEmits<{
    confirm: []
  }>();

  const open = ref(false);

  const activatorProps = {
    onClick: () => {
      open.value = true;
    },
  };

  function confirm() {
    emit('confirm');
    open.value = false;
  }
</script>
