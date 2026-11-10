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
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="optionsVisible"
        :aria-controls="optionsVisible ? listboxId : undefined"
        :aria-activedescendant="optionsVisible ? optionId(activeIndex) : undefined"
        type="text"
        autocomplete="off"
        @focus="citySearchFocused = true; listOpen = true"
        @input="listOpen = true"
        @keydown="onKeydown"
        v-model="citySearchText" />
    </div>
    <small
      :id="hintId"
      class="search-city__hint"
      :class="{ 'sr-only': !hintVisible }"
    >{{ t('message.typeAtLeastNCharacters', { n: MIN_SEARCH_CHARACTERS }) }}</small>
    <div v-if="searchResultsVisible" class="search-city__results">
      <div v-if="citySearchLoading" class="search-city__status" aria-busy="true">
        <Skeleton height="18.5px" />
      </div>
      <p v-else-if="citySearchError" class="search-city__status search-city__empty">{{ t('message.searchFailed') }}</p>
      <p v-else-if="!citiesSearchResult.length" class="search-city__status search-city__empty">{{ t('message.noData') }}</p>
      <ul v-else :id="listboxId" role="listbox" :aria-label="t('message.cities')" class="search-city__options">
        <li
          v-for="(proposedCity, index) in citiesSearchResult"
          :key="proposedCity.place_id"
          :id="optionId(index)"
          role="option"
          :aria-selected="index === activeIndex"
          class="search-city__result"
          :class="{ 'search-city__result--active': index === activeIndex }"
          @mousedown.prevent
          @mousemove="activeIndex = index"
          @click="pickCity(proposedCity)"
        >
          <template v-for="(part, partIndex) in highlightMatch(proposedCity.cityLabel, citySearchText)" :key="partIndex">
            <strong v-if="part.match">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Skeleton from '@/components/base/Skeleton.vue';
  import { computed, ref, useId, useTemplateRef, watch } from 'vue';
  import { debounce, highlightMatch, useClickOutside } from '@/utils';
  import type { LocationModel, SearchCitiesRequest, SearchCitiesResultModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import { useAsyncData } from '@/composables';
  import { MIN_SEARCH_CHARACTERS } from '@/static';
  import { useI18n } from 'vue-i18n';

  const { locale, t } = useI18n();

  const inputId = useId();
  const hintId = useId();
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const citySearchText = ref('');
  const citySearchFocused = ref(false);
  /** Escape and picking a city close the list; focusing or typing opens it again. */
  const listOpen = ref(false);

  const {
    data: searchData,
    loading: searchRequestLoading,
    error: citySearchError,
    load: searchCities,
    reset: resetSearch,
  } = useAsyncData((request: SearchCitiesRequest) => GeoapifyApiService.searchCities(request));
  const citiesSearchResult = computed(() => searchData.value ?? []);

  // True from the keystroke until the debounced search starts, so the placeholder shows at once.
  const searchQueued = ref(false);
  const citySearchLoading = computed(() => searchQueued.value || searchRequestLoading.value);

  const emit = defineEmits<{
    select: [cityLocation: LocationModel]
  }>();

  // Handle click outside search city list
  const searchCityBoxRef = useTemplateRef('searchCityBoxRef');
  useClickOutside(searchCityBoxRef, () => {
    citySearchFocused.value = false
    listOpen.value = false
  });

  const searchResultsVisible = computed(() => {
    return citySearchFocused.value && listOpen.value && citySearchText.value?.length >= MIN_SEARCH_CHARACTERS;
  });

  /** The listbox shows only once there are results; loading, errors and "no data" are plain text. */
  const optionsVisible = computed(() => {
    return searchResultsVisible.value
      && !citySearchLoading.value
      && !citySearchError.value
      && citiesSearchResult.value.length > 0;
  });

  // The design opens with the first result active, so Enter picks it straight away.
  const activeIndex = ref(0);
  watch(citiesSearchResult, () => {
    activeIndex.value = 0;
  });

  // Show the "type at least N characters" hint only while it applies.
  const hintVisible = computed(() => {
    const length = citySearchText.value?.length ?? 0;
    return citySearchFocused.value && length > 0 && length < MIN_SEARCH_CHARACTERS;
  });

  // Select Location logic
  function pickCity({lat, lon}: SearchCitiesResultModel) {
    emit('select', {lat, lon});
    citySearchText.value = '';
    listOpen.value = false;
  }

  // Combobox keys: arrows move through the results (wrapping at the ends), Enter picks, Escape closes.
  function onKeydown(event: KeyboardEvent) {
    const count = citiesSearchResult.value.length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!listOpen.value) {
          listOpen.value = true;
          activeIndex.value = 0;
          return;
        }
        if (optionsVisible.value) {
          const step = event.key === 'ArrowDown' ? 1 : -1;
          activeIndex.value = (activeIndex.value + step + count) % count;
        }
        return;
      }
      case 'Enter': {
        // Enter that confirms an input-method composition is not a pick.
        if (optionsVisible.value && !event.isComposing) {
          event.preventDefault();
          pickCity(citiesSearchResult.value[activeIndex.value]);
        }
        return;
      }
      case 'Escape': {
        if (listOpen.value) {
          listOpen.value = false;
        }
        return;
      }
    }
  }

  // Search city
  const loadCitiesBySearch = debounce((request: SearchCitiesRequest) => {
    searchQueued.value = false;
    searchCities(request);
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
      // Results for the old text must not show up while the new search waits for the debounce.
      resetSearch();
      if(lastCitySearchText?.length < MIN_SEARCH_CHARACTERS) {
        searchQueued.value = false;
        return;
      }

      searchQueued.value = true;
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

    }

    &__options {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &__status,
    &__result {
      margin: 0;
      padding: 9px 10px;
      border-radius: var(--radius-sm);
    }

    &__empty {
      color: var(--color-text-muted);
    }

    &__result {
      cursor: pointer;

      strong {
        font-weight: 700;
      }

      &--active {
        background: var(--color-accent-soft);
      }
    }
  }
</style>
