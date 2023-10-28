<script setup lang="ts">
const props = defineProps(["channels"]);

</script>

<template>
  <p>{{ props.channels.name }}</p>
</template>

<style scoped>
</style>