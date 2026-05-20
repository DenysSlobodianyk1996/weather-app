<template>
  <main>
    <ContentContainer>
      <slot></slot>
    </ContentContainer>
  </main>
</template>

<script setup>
  import ContentContainer from './ContentContainer.vue'
</script>

<style lang="scss" scoped>
  main {
    flex: 1 1 auto;
  }
</style>