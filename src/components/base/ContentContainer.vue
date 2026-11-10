<template>
  <div class="content-container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  .content-container {
    max-width: var(--content-max-width);
    width: 100%;
    min-width: 0;
    margin: 0 auto;
    padding: 0 var(--page-gutter);
    position: relative;
  }
</style>
