<template>
  <main class="main">
    <ContentContainer>
      <slot></slot>
    </ContentContainer>
  </main>
</template>

<script setup lang="ts">
  import ContentContainer from '../base/ContentContainer.vue'
</script>

<style lang="scss" scoped>
  .main {
    flex: 1 1 auto;
    padding: var(--page-gutter) 0;
    min-width: 0;
  }
</style>
