<script setup lang="ts">
// import router from "@/router";
// import { ref } from "vue";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

// data for get the channel created by the user
const created_channels = ref<Array<Record<string, string>>>([]);
const channel_name = ref("");
const channel_expiredtime = ref("");
const channel_address = ref("");

const emit = defineEmits(["refreshChannel"]);
const createChannel = async (channel_name: string, channel_address: string, channel_expiredtime: string) => {
  const channel_expiredtime_int = parseInt(channel_expiredtime);
  try {
    console.log(typeof channel_name, channel_address, channel_expiredtime_int);
    await fetchy("/api/channel", "POST", {
      body: { name: channel_name, address: channel_address, expiredtime: channel_expiredtime_int },
    });
    console.log("Successfully create channel");
  } catch (_) {
    return;
  }
  emit("refreshChannel");
  emptyForm();
};

const emptyForm = () => {
  channel_name.value = "";
  channel_expiredtime.value = "";
  channel_address.value = "";
};
</script>

<template>
  <form @submit.prevent="createChannel(channel_name, channel_address, channel_expiredtime)">
    <label class="form-title" for="channel_name">Channel Name</label>
    <input class="form-input" id="channel_name" v-model="channel_name" placeholder="ex: MIT EECS Department Midterm Party" required />
    <br />
    <label class="form-title" for="channel_address">Channel Address</label>
    <input class="form-input" id="channel_address" v-model="channel_address" placeholder="ex: MIT building 34" required />
    <br />
    <label class="form-title" for="channel_expiredtime">Ticket Time </label>
    <input class="form-input" id="channel_expiredtime" v-model="channel_expiredtime" placeholder="ex: 24 (in hour, please submit a positive number)" required />
    <br />
    <button type="submit" class="submit-button">Create My Channel</button>
  </form>
  <br />
  <!-- <section v-if="loaded && created_channels.length !== 0">
    <h2>Your Created Channels</h2>
    <ChannelMenu />
  </section> -->
</template>

<style scoped>
h2 {
  text-align: start;
  margin: 30px 0px 30px 40px;
  font-size: 30px;
  color: rgb(56, 154, 41);
}
h3 {
  display: flex;
  justify-content: center;
}
form {
  width: 60%;
  margin: 0 auto;
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 2em;
}

seperator-line {
  width: 100px;
  height: 3px;
  align-items: center;
  background-color: #945b5b;
  margin: 10px 0px 10px 40px;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.form-title {
  text-align: start;
  margin: 0px 0px 0px 5px;
  font-size: 20px;
  font-weight: bold;
  color: rgb(56, 154, 41);
}

.submit-button {
  height: 3em;
  width: 20em;
  margin: 0 auto;
  color: #fafdf9;
  background-color: rgb(65, 129, 171);
  border: 3px solid #dee2e6;
  border-radius: 1em;
  padding: 0.375em 0.75em;
  text-decoration: none;
}

/* style for input */
.form-input {
  height: 2em;
  width: 95%;
  /* margin: 0 auto; */
  color: #64676a;
  background-color: #fff;
  border: 3px solid #dee2e6;
  border-radius: 0.7em;
  padding: 0.375em 0.75em;
  text-decoration: none;
}
</style>
