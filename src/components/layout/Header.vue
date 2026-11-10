<template>
  <header class="header">
    <ContentContainer>
      <div class="header__inner">
        <div class="header__brand">
          <svg class="header__logo" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <circle class="header__logo-sun" cx="13" cy="13" r="7"></circle>
            <path class="header__logo-cloud" d="M10 26h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2.2A4 4 0 0 0 10 26z" stroke-width="2"></path>
          </svg>
          <h1 class="header__title">{{ t('app.title') }}</h1>
        </div>

        <Button
          class="header__language"
          :aria-label="t('header.changeLanguage', { lang: localeCode })"
          @click="changeLanguage"
        >
          <span class="material-icons" aria-hidden="true">language</span>
          <span class="header__language-code">{{ localeCode }}</span>
        </Button>
      </div>
    </ContentContainer>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ContentContainer from '../base/ContentContainer.vue'
  import Button from '../base/Button.vue'

  const { t, locale, availableLocales } = useI18n()

  const localeCode = computed(() => locale.value.toLocaleUpperCase())

  function changeLanguage (): void {
    const currentLangIndex = availableLocales.indexOf(locale.value)
    const newIndex = currentLangIndex + 1 === availableLocales.length ? 0 : currentLangIndex + 1
    locale.value = availableLocales[newIndex]
  }
</script>

<style lang="scss" scoped>
  .header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 2;

    &__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3) 0;
    }

    &__brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-width: 0;
    }

    &__logo {
      flex: none;
    }

    &__logo-sun {
      fill: var(--color-sun);
    }

    &__logo-cloud {
      fill: var(--color-surface);
      stroke: var(--color-accent);
    }

    &__title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      line-height: 1.2;
    }

    // Two classes so these win over the base Button padding.
    &__inner &__language {
      min-height: 36px;
      padding: 0 var(--space-3);
    }

    &__language-code {
      font-weight: 600;
      color: var(--color-text);
    }
  }
</style>
