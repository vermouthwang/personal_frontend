<script setup lang="ts">
import { ref } from "vue";

const eventname = ref("");
const emit = defineEmits(["getEventsByName"]);
</script>

<template>
  <form @submit.prevent="emit('getEventsByName', eventname)" class="pure-form">
    <fieldset>
      <legend>Search by Event Name</legend>
      <input id="eventname" type="text" v-model="eventname" placeholder="Event Name" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
