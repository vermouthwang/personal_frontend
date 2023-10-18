<script setup lang="ts">
// import { useUserStore } from "@/stores/user";
// import { storeToRefs } from "pinia";

const props = defineProps(["event"]);
const emit = defineEmits(["refreshEvents"]);

// const { currentUsername } = storeToRefs(useUserStore());
// async function deleteEvent(name: string) {
//   try {
//     await fetchy("/api/event", "DELETE", { name });
//   } catch {
//     return;
//   }
//   emit("refreshEvents");
// }
</script>

<template>
  <p class="eventname">{{ props.event.name }}</p>
  <p>{{ props.event.eventinfo }}</p>
  <p>{{ props.event.address }}</p>
  <!-- <p>{{ props.event.eventMember }}</p> -->
</template>

<style scoped>
p {
  margin: 0em;
}
.eventname {
  font-weight: bold;
  font-size: 1.2em;
}
</style>
