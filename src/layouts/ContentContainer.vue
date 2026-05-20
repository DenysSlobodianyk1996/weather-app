<template>
  <div id="content-container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  #content-container {
    max-width: 1200px;
    min-width: 360px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    position: relative;
  }
</style>