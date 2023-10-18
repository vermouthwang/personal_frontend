<script setup lang="ts">
import CreateEventForm from "@/components/Event/CreateEventForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { onBeforeMount } from "vue";
import SearchEventForm from "@/components/Event/SearchEventForm.vue";
import EventComponent from "@/components/Event/EventComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let events = ref<Array<Record<string, string>>>([]);
let searchEvent = ref("");

async function getEvents(name?: string) {
  // let query: Record<string, string> = name !== undefined ? { name } : {};
  let query: Record<string, string> = name !== undefined ? { name } : {};
  let eventResults;
  console.log("query", query, eventResults);
  try {
    eventResults = await fetchy("/api/event", "GET", { query });
    console.log(eventResults);
  } catch (_) {
    return;
  }
  searchEvent.value = name ? name : "";
  events.value = eventResults;
  console.log(events.value);
}

onBeforeMount(async () => {
  await getEvents();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <CreateEventForm @refreshEvents="getEvents" />
  </section>
  <div class="row">
    <h2 v-if="!searchEvent">Events:</h2>
    <h2 v-else>Events by {{ searchEvent }}:</h2>
    <SearchEventForm @getEventsByName="getEvents" />
  </div>
  <section class="events" v-if="loaded && events.length !== 0">
    <article>
      <EventComponent :event="events" @refreshEvents="getEvents" />
    </article>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.events {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
