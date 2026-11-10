<template>
  <Button
    class="remove-favorite active"
    :aria-label="t('cityCard.removeFromFavorites')"
    @click="emit('remove')"
  >
    <span class="material-icons" aria-hidden="true">favorite</span>
    {{ t('cityCard.remove') }}
  </Button>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import Button from '@/components/base/Button.vue';

  const { t } = useI18n();

  const emit = defineEmits<{
    remove: []
  }>();
</script>

<style lang="scss" scoped>
  .remove-favorite .material-icons {
    font-size: 18px;
  }
</style>
