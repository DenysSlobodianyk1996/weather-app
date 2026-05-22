<template>
  <header>
    <ContentContainer>
      <h1>{{ t('app.title') }}</h1>
      <img :src="logoSrc" alt="Logo">

      <Button
        id="change-language"
        @click="changeLanguage"
      >
        <span class="material-icons">language</span>
        <span>{{ locale?.toLocaleUpperCase() }}</span>
      </Button>
    </ContentContainer>
  </header>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import ContentContainer from '../base/ContentContainer.vue'
  import Button from '../base/Button.vue'

  const { t, locale, availableLocales } = useI18n()
  const baseUrl = import.meta.env.BASE_URL
  const logoSrc = `${baseUrl}weather.png`;

  function changeLanguage (): void {
    const currentLangIndex = availableLocales.indexOf(locale.value)
    const newIndex = currentLangIndex + 1 === availableLocales.length ? 0 : currentLangIndex + 1
    const newLocale = availableLocales[newIndex]
    locale.value = newLocale
  }
</script>

<style lang="scss" scoped>
  header {
    background: #eee;
    position: sticky;
    top: 0;
    z-index: 2;

    #content-container {
      // Used inside ContentContainer
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      box-sizing: border-box;
    }

    img {
      width: 32px;
      height: 32px;
      height: auto;
    }

    button[id="change-language"] {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>