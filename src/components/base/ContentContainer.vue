<template>
  <div id="content-container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  #content-container {
    max-width: 1200px;
    // min-width: 360px; // When set 360, on mobile horizontal scroll takes 15px
    min-width: 345px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    position: relative;
  }
</style>