<template>
  <button v-bind="$attrs">
    <slot></slot>
  </button>
</template>

<script setup>
</script>

<style lang="scss" scoped>
  button {
    all: unset;
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    padding: 8px;
    background: rgba($color: #ddd, $alpha: .4);
    &:hover,
    &.active {
      background: #ddd;
    }
    &:disabled {
      cursor: not-allowed;
    }
  }
</style>