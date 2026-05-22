<template>
  <header>
    <ContentContainer>
      <h1>{{ t('app.title') }}</h1>
      <img :src="logoSrc" alt="Logo">

      <Button
        id="change-language"
        :title="t('app.toggleLanguage')"
        @click="changeLanguage"
      >
        <span class="material-icons">language</span>
        <span>{{ locale?.toLocaleUpperCase() }}</span>
      </Button>
    </ContentContainer>
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ContentContainer from '../base/ContentContainer.vue'
  import Button from '../base/Button.vue'

  const { t, locale, availableLocales } = useI18n()
  const logoSrc = ref('/weather.png')

  function changeLanguage (): void {
    const currentLangIndex = availableLocales.indexOf(locale.value)
    const newIndex = currentLangIndex + 1 === availableLocales.length ? 0 : currentLangIndex + 1
    const newLocale = availableLocales[newIndex]
    locale.value = newLocale
  }
</script>

<style lang="scss" scoped>
  header {
    padding: 16px;
    background: #eee;
    position: sticky;
    top: 0;
    z-index: 2;

    #content-container {
      // Used inside ContentContainer
      display: flex;
      justify-content: center;
      gap: 16px;
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