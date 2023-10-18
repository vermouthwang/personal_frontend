<script setup lang="ts">
import EventListComponent from "@/components/Event/EventListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Event Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <EventListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
