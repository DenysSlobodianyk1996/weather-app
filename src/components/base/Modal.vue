<template>
  <dialog
    ref="dialog"
    class="modal"
    aria-modal="true"
    :aria-labelledby="titleId"
    @keydown.esc.prevent="close"
    @cancel.prevent="close"
    @close="onNativeClose"
  >
    <div v-if="$slots.icon" class="modal__icon" aria-hidden="true">
      <slot name="icon"></slot>
    </div>
    <h2 :id="titleId" class="modal__title">
      <slot name="title"></slot>
    </h2>
    <div class="modal__body">
      <slot></slot>
    </div>
    <div class="modal__actions">
      <slot name="actions"></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, useId, useTemplateRef, watch } from 'vue';

  /**
   * An accessible modal on the native `<dialog>`: labelled by its title, focus moves in on open and
   * back to where it was on close, and Escape closes it. The owner keeps it open with `v-model:open`.
   */
  const open = defineModel<boolean>('open', { required: true });

  const titleId = useId();
  const dialogRef = useTemplateRef('dialog');
  let focusBeforeOpen: HTMLElement | null = null;

  function close() {
    open.value = false;
  }

  // The browser closed the dialog itself (a form with method="dialog", say): tell the owner. The event comes
  // later than close(), so a dialog that was opened again by then stays open.
  function onNativeClose() {
    if(open.value && !dialogRef.value?.open) {
      close();
    }
  }

  function show() {
    const dialog = dialogRef.value;
    if(!dialog || dialog.open) {
      return;
    }
    focusBeforeOpen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    // An `autofocus` control wins; otherwise the first button, which is the safe choice in every modal here.
    const target = dialog.querySelector<HTMLElement>('[autofocus]') ?? dialog.querySelector<HTMLElement>('button');
    target?.focus();
  }

  function hide() {
    const dialog = dialogRef.value;
    if(dialog?.open) {
      dialog.close();
    }
    restoreFocus();
  }

  // Back to the opener, unless it is gone or something else (an "Open Favorites" button, say) already took focus.
  function restoreFocus() {
    const previous = focusBeforeOpen;
    focusBeforeOpen = null;
    const active = document.activeElement;
    const focusIsLost = !active || active === document.body || !!dialogRef.value?.contains(active);
    if(previous?.isConnected && focusIsLost) {
      previous.focus();
    }
  }

  watch(open, isOpen => (isOpen ? show() : hide()), { flush: 'post' });
  onMounted(() => {
    if(open.value) {
      show();
    }
  });
  onBeforeUnmount(() => {
    if(open.value) {
      hide();
    }
  });
</script>

<style lang="scss" scoped>
  .modal {
    width: min(440px, calc(100vw - 2 * var(--page-gutter)));
    max-width: none;
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

    &__icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-accent-soft);
      color: var(--color-accent);

      :deep(.material-icons) {
        font-size: 22px;
      }
    }

    &__title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.3;
    }

    &__body {
      color: var(--color-text-muted);

      :deep(p) {
        margin: 0;
      }
    }

    &__actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
      flex-wrap: wrap;
    }
  }
</style>
