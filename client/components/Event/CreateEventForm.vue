<script setup lang="ts">
// import router from "@/router";
// import { useEventStore } from "@/stores/event";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const eventinfo = ref("");
const address = ref("");
const emit = defineEmits(["refreshEvents"]);
// const { createEvent } = useEventStore();
const createEvent = async (name: string, eventinfo: string, address: string) => {
  console.log(name, eventinfo, address);
  try {
    await fetchy("/api/event", "POST", {
      body: { name, eventinfo, address },
    });
  } catch (_) {
    return;
  }

  emit("refreshEvents");
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  eventinfo.value = "";
  address.value = "";
  console.log("clear");
};
</script>

<template>
  <form @submit.prevent="createEvent(name, eventinfo, address)">
    <label for="name">eventname</label>
    <input id="name" v-model="name" placeholder="Create a event!" required />
    <label for="eventinfo">eventinfo</label>
    <input id="eventinfo" v-model="eventinfo" placeholder="Write some info!" required />
    <label for="address">eventaddress</label>
    <input id="address" v-model="address" placeholder="Provide the address!" required />
    <button type="submit" class="pure-button-primary pure-button">Create Event</button>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
