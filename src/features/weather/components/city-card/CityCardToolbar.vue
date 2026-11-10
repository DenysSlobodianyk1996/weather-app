<template>
  <div class="card-toolbar">
    <CitySearch class="card-toolbar__search" @select="emit('select', $event)" />

    <Button
      icon
      :aria-label="t('cityCard.useMyLocation')"
      @click="selectMyLocation"
    >
      <span class="material-icons" aria-hidden="true">my_location</span>
    </Button>

    <div class="card-toolbar__spacer"></div>

    <Button
      v-if="hasLocation && !hideFavoriteAction"
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
      :id="dialogId"
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
      <template #dialogContent>
        <h3>{{ t('message.deleteThisCard') }}</h3>
      </template>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
  import { useId } from 'vue';
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
    hideFavoriteAction?: boolean
  }>();

  const emit = defineEmits<{
    select: [cityLocation: LocationModel]
    toggleFavorite: []
    remove: []
  }>();

  const dialogId = useId();

  function selectMyLocation() {
    GeoapifyApiService.getIpLocation()
      .then(ipLocation => {
        if(ipLocation) {
          emit('select', ipLocation);
        } else {
          alert(t('message.noData'))
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
  }

  @media (max-width: 599px) {
    .card-toolbar__search {
      flex-basis: 100%;
      max-width: none;
    }
  }
</style>
