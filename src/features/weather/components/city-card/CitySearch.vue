<template>
  <div ref="searchCityBoxRef" class="search-city">
    <label :for="inputId" class="sr-only">{{ t('message.searchCity') }}</label>
    <div class="search-city__field">
      <span class="material-icons search-city__icon" aria-hidden="true">search</span>
      <input
        :id="inputId"
        class="search-city__input"
        :placeholder="t('message.searchCity')"
        :aria-describedby="hintId"
        type="text"
        autocomplete="off"
        @focus="citySearchFocused = true"
        v-model="citySearchText" />
    </div>
    <small
      :id="hintId"
      class="search-city__hint"
      :class="{ 'sr-only': !hintVisible }"
    >{{ t('message.typeAtLeastNCharacters', { n: MIN_SEARCH_CHARACTERS }) }}</small>
    <template v-if="searchResultsVisible">
      <ul class="search-city__results">
        <template v-if="citySearchLoading">
          <li>
            <Skeleton height="18.5px" />
          </li>
        </template>
        <template v-else-if="!citiesSearchResult.length">
          <li class="search-city__empty">{{ t('message.noData') }}</li>
        </template>
        <template v-else>
          <template v-for="proposedCity in citiesSearchResult" :key="proposedCity.place_id">
            <li class="search-city__result" @click.prevent="selectCityFromSearchResult(proposedCity); citySearchText = ''">
              {{ proposedCity.cityLabel }}
            </li>
          </template>
        </template>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
  import Skeleton from '@/components/base/Skeleton.vue';
  import { computed, ref, useId, useTemplateRef, watch } from 'vue';
  import { debounce, useClickOutside } from '@/utils';
  import type { LocationModel, SearchCitiesRequest, SearchCitiesResultModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import { MIN_SEARCH_CHARACTERS } from '@/static';
  import { useI18n } from 'vue-i18n';

  const { locale, t } = useI18n();

  const inputId = useId();
  const hintId = useId();

  const citySearchText = ref('');
  const citySearchLoading = ref(false);
  const citySearchFocused = ref(false);
  const citiesSearchResult = ref<SearchCitiesResultModel[]>([]);

  const emit = defineEmits<{
    select: [cityLocation: LocationModel]
  }>();

  // Handle click outside search city list
  const searchCityBoxRef = useTemplateRef('searchCityBoxRef');
  useClickOutside(searchCityBoxRef, () => {
    citySearchFocused.value = false
  });

  const searchResultsVisible = computed(() => {
    return citySearchFocused.value && citySearchText.value?.length >= MIN_SEARCH_CHARACTERS;
  });

  // Show the "type at least N characters" hint only while it applies.
  const hintVisible = computed(() => {
    const length = citySearchText.value?.length ?? 0;
    return citySearchFocused.value && length > 0 && length < MIN_SEARCH_CHARACTERS;
  });

  // Select Location logic
  function selectCityFromSearchResult({lat, lon}: SearchCitiesResultModel) {
    emit('select', {lat, lon});
  }

  // Search city
  const loadCitiesBySearch = debounce((request: SearchCitiesRequest) => {
    GeoapifyApiService.searchCities(request)
      .then(cities => {
        citiesSearchResult.value = cities;
      })
      .finally(() => {
        citySearchLoading.value = false;
      })
  }, 500);

   watch(
    () => locale.value,
    () => {
      // When locale changed - clear search (type with new lang format)
       citySearchText.value = '';
    }
  );
  watch(
    () => citySearchText.value,
    lastCitySearchText => {
      if(lastCitySearchText?.length < MIN_SEARCH_CHARACTERS) {
        citiesSearchResult.value = [];
        citySearchLoading.value = false;
        return;
      }

      citySearchLoading.value = true;
      loadCitiesBySearch({
        text: lastCitySearchText,
        lang: locale.value
      });
    },
    {
      immediate: true
    }
  )
</script>

<style lang="scss" scoped>
  .search-city {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    position: relative;
    min-width: 0;

    &__field {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      height: var(--control-height);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);

      &:focus-within {
        background: var(--color-surface);
        border-color: var(--color-accent);
        box-shadow: 0 0 0 1px var(--color-accent);
      }
    }

    &__icon {
      font-size: 20px;
      color: var(--color-text-muted);
    }

    &__input {
      flex: 1;
      min-width: 0;
      border: 0;
      background: none;
      color: var(--color-text);
      outline: none;

      &::placeholder {
        color: var(--color-text-muted);
      }
    }

    &__hint {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    &__results {
      position: absolute;
      top: calc(var(--control-height) + var(--space-1));
      left: 0;
      right: 0;
      max-height: 300px;
      overflow-y: auto;
      margin: 0;
      padding: var(--space-1);
      list-style: none;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-popover);
      z-index: 2;

      li {
        padding: 9px 10px;
        border-radius: var(--radius-sm);
      }
    }

    &__empty {
      color: var(--color-text-muted);
    }

    &__result {
      cursor: pointer;

      &:hover {
        background: var(--color-accent-soft);
      }
    }
  }
</style>
