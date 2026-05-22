<template>
  <div ref="searchCityBoxRef" class="search-city">
    <div class="input-wrapper">
      <div class="input-with-addon">
        <input
          id="search-input"
          placeholder="Search city"
          ref="searchInput"
          type="text"
          @focus="citySearchFocused = true"
          v-model="citySearchText" />
        <Button @click="selectMyLocation">
          <span class="material-icons">my_location</span>
        </Button>
      </div>
      <small>{{ t('message.typeAtLeastNCharacters', { n: MIN_SEARCH_CHARACTERS }) }}</small>
    </div>
    <template v-if="searchResultsVisible">
      <ul class="search-city__results">
        <template v-if="citySearchLoading">
          <li>
            <Skeleton height="18.5px" />
          </li>
        </template>
        <template v-else-if="!citiesSearchResult.length">
          <li>{{ t('message.noData') }}</li>
        </template>
        <template v-else>
          <template v-for="proposedCity in citiesSearchResult" :key="proposedCity.place_id">
            <li class="result-item" @click.prevent="selectCityFromSearchResult(proposedCity); citySearchText = ''">
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
  import Button from '@/components/base/Button.vue';
  import { computed, ref, useTemplateRef, watch } from 'vue';
  import { debounce, useClickOutside } from '@/utils';
  import type { LocationModel, SearchCitiesRequest, SearchCitiesResultModel } from '@/models';
  import { GeoapifyApiService } from '@/services';
  import { MIN_SEARCH_CHARACTERS } from '@/static';
  import { useI18n } from 'vue-i18n';

  const { locale, t } = useI18n();

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

  // Select Location logic
  function selectCityFromSearchResult({lat, lon}: SearchCitiesResultModel) {
    emit('select', {lat, lon});
  }

  function selectMyLocation() {
    GeoapifyApiService.getIpLocation()
      .then(ipLocation => {
        emit('select', ipLocation);
      });
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
    position: relative;
    max-width: 200px;
    width: 100%;

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 100%;

      .input-with-addon {
        display: inline-flex;
        align-items: center;
        gap: 4px;

        input[id="search-input"] {
          padding: 8px;
          margin: 4px 0;
        }
      }
    }

    &__results {
      position: absolute;
      top: 100%;
      background: #eee;
      max-height: 300px;
      overflow-y: auto;
      box-sizing: border-box;
      width: 100%;
      border-radius: 8px;
      list-style: none;
      margin-top: 2px;
      padding: 0;
      z-index: 2;

      li {
        padding: 8px;

        &.result-item {
          cursor: pointer;
          &:hover {
            background-color: #ddd;
          }
        }
      }
    }
  }
</style>
