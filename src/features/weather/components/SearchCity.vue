<template>
  <div ref="searchCityBoxRef" class="search-city">
    <input
      id="search-input"
      placeholder="Search city"
      ref="searchInput"
      type="text"
      @focus="citySearchFocused = true"
      v-model="citySearchText" />
    <template v-if="searchResultsVisible">
      <ul class="search-city__results">
        <template v-for="proposedCity in citiesSearchResult" :key="proposedCity.place_id">
          <li class="result-item" @click.prevent="emit('select', proposedCity); citySearchText = ''">
            {{ proposedCity.cityLabel }}
          </li>
        </template>
        <template v-if="!citiesSearchResult.length">
          <li class="no-results">No results found</li>
        </template>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useTemplateRef, watch } from 'vue';
  import { useClickOutside } from '@/utils';
  import type { SearchCitiesRequest, SearchCityModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import { MIN_SEARCH_CHARACTERS } from '@/static';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n();

  const citySearchText = ref('');
  const citySearchFocused = ref(false);
  const citiesSearchResult = ref<SearchCityModel[]>([]);

  const emit = defineEmits<{
    select: [city: SearchCityModel]
  }>();

  // Handle click outside search city list
  const searchCityBoxRef = useTemplateRef('searchCityBoxRef');
  useClickOutside(searchCityBoxRef, () => {
    citySearchFocused.value = false
  });

  const searchResultsVisible = computed(() => {
    return citySearchFocused.value && citySearchText.value?.length > MIN_SEARCH_CHARACTERS;
  });

  function loadCitiesBySearch(request: SearchCitiesRequest) {
    GeoapifyApiService.searchCities(request)
      .then(cities => {
        citiesSearchResult.value = cities
      })
  }

  // Search city
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
        return;
      }

      loadCitiesBySearch({
        search: lastCitySearchText,
        locale: locale.value
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
    position: relative;
    max-width: 200px;
    width: 100%;

    input {
      padding: 8px;
      margin: 4px 0;
      width: 100%;
    }
    &__results {
      position: absolute;
      top: 100%;
      background: #ddd;
      max-height: 300px;
      overflow-y: auto;
      box-sizing: border-box;
      width: 100%;
      border-radius: 8px;
      list-style: none;
      margin: 0;
      padding: 0;

      .no-results,
      .result-item {
        padding: 8px;
      }

      .result-item {
        cursor: pointer;
        &:hover {
          background-color: #eee;
        }
      }
    }
  }
</style>
