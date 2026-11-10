<template>
  <Modal :open="!!limit" @update:open="isOpen => !isOpen && emit('close')">
    <template #icon>
      <span class="material-icons">{{ limit === 'cards' ? 'view_agenda' : 'favorite' }}</span>
    </template>
    <template #title>
      {{ limit === 'cards' ? t('limits.cardsTitle') : t('limits.favoritesTitle') }}
    </template>
    <p>{{ text }}</p>
    <template #actions>
      <Button v-if="limit === 'favorites'" @click="emit('openFavorites')">
        {{ t('limits.openFavorites') }}
      </Button>
      <Button variant="primary" autofocus @click="emit('close')">{{ t('limits.ok') }}</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Button from '@/components/base/Button.vue';
  import Modal from '@/components/base/Modal.vue';
  import { MAX_CITY_CARDS, MAX_FAVORITES } from '../city-cards';

  export type Limit = 'cards' | 'favorites';

  const { t } = useI18n();

  const props = defineProps<{
    /** The limit the user just hit; the modal is open while this is set. */
    limit: Limit | null
    /** The city the user tried to save as a Favorite, if its name is known. */
    cityName?: string
  }>();

  const emit = defineEmits<{
    close: []
    /** "Open Favorites": the owner switches to the Favorites tab and closes the modal. */
    openFavorites: []
  }>();

  const text = computed(() => {
    if(props.limit === 'cards') {
      return t('limits.cardsText', { max: MAX_CITY_CARDS });
    }
    return props.cityName
      ? t('limits.favoritesText', { max: MAX_FAVORITES, city: props.cityName })
      : t('limits.favoritesTextNoCity', { max: MAX_FAVORITES });
  });
</script>
