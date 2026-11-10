<template>
  <div class="card-toolbar">
    <CitySearch class="card-toolbar__search" @select="selectCity" />

    <Button
      icon
      :aria-label="t('cityCard.useMyLocation')"
      @click="selectMyLocation"
    >
      <span class="material-icons" aria-hidden="true">my_location</span>
    </Button>

    <div class="card-toolbar__spacer"></div>

    <Button
      v-if="hasLocation"
      icon
      :class="{ active: isFavorite }"
      :aria-label="isFavorite ? t('cityCard.removeFromFavorites') : t('cityCard.addToFavorites')"
      :aria-pressed="isFavorite"
      @click="emit('toggleFavorite')"
    >
      <span class="material-icons" aria-hidden="true">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
    </Button>

    <ConfirmDialog
      v-if="!hideRemoveAction"
      danger
      :confirm-label="t('deleteCard.confirm')"
      @confirm="emit('remove')"
    >
      <template #dialogActivator="{ props: activatorProps }">
        <Button
          v-bind="activatorProps"
          icon
          :aria-label="t('cityCard.deleteCard')"
        >
          <span class="material-icons" aria-hidden="true">delete_outline</span>
        </Button>
      </template>
      <template #title>
        {{ cityName ? t('deleteCard.title', { city: cityName }) : t('deleteCard.titleNoCity') }}
      </template>
      <p>
        {{ t('deleteCard.removedFromMain') }}
        <template v-if="isFavorite">
          {{ t('deleteCard.staysInFavorites', { city: cityName ?? t('deleteCard.thisCity') }) }}
        </template>
      </p>
    </ConfirmDialog>

    <p v-if="locationFailed" class="card-toolbar__error" role="alert">
      <span class="material-icons card-toolbar__error-icon" aria-hidden="true">error_outline</span>
      {{ t('cityCard.locationFailed') }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { LocationModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import Button from '@/components/base/Button.vue';
  import ConfirmDialog from '@/components/base/ConfirmDialog.vue';
  import CitySearch from './CitySearch.vue';

  const { t } = useI18n();

  defineProps<{
    hasLocation: boolean
    isFavorite: boolean
    hideRemoveAction?: boolean
    /** The card's city as its heading shows it, once loaded. Named in the delete confirmation. */
    cityName?: string
  }>();

  const emit = defineEmits<{
    select: [cityLocation: LocationModel]
    toggleFavorite: []
    remove: []
  }>();

  /** The last "Use my location" lookup failed. Shown inline, so nothing blocks the page. */
  const locationFailed = ref(false);

  function selectCity(cityLocation: LocationModel) {
    locationFailed.value = false;
    emit('select', cityLocation);
  }

  function selectMyLocation() {
    GeoapifyApiService.getIpLocation()
      .then(result => {
        if(result.ok) {
          selectCity(result.data);
        } else {
          locationFailed.value = true;
        }
      });
  }
</script>

<style lang="scss" scoped>
  .card-toolbar {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--space-2);

    &__search {
      flex: 1 1 260px;
      max-width: 360px;
    }

    &__spacer {
      flex-grow: 1;
    }

    &__error {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-basis: 100%;
      margin: 0;
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-md);
      color: var(--color-danger-text);
      background: var(--color-danger-soft);
      border: 1px solid var(--color-danger-border);
      border-radius: var(--radius-md);
    }

    &__error-icon {
      flex: none;
      font-size: 18px;
      color: var(--color-danger);
    }
  }

  @media (max-width: 599px) {
    .card-toolbar__search {
      flex-basis: 100%;
      max-width: none;
    }
  }
</style>
