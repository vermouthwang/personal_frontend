<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";
// import router from "@/router";
// import { useEventStore } from "@/stores/event";
// data need for create a channel
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["channels"]);
const emit = defineEmits(["refreshChannel"]);

let expirationtime = ref("");

const getExpirationTime = async (name: string) => {
  let expiration_time;
  try {
    expiration_time = await fetchy("/api/expiretime", "GET", {
      body: { name: name },
    });
    console.log("not catch");
  } catch (_) {
    return;
  }
  expirationtime.value = expiration_time;
};

const rejoinchannel = async (name: string) => {
  try {
    await fetchy("/api/access/rejoin", "PUT", {body:{ name: name }});
  } catch (_) {
    return;
  }
  console.log("rejoin")
  // await getChannel();
};

onBeforeMount(async () => {
  await getExpirationTime(props.channels.name);
});

let expiretime = ref(" ");
const getexpiretime = async (channelname: string) => {
  let query: Record<string, string> = channelname !== undefined ? { channelname } : {};
  let the_expiretime;
  the_expiretime = await fetchy("/api/profile/time", "GET", {query});
  expiretime.value = the_expiretime;
}
// const {currentUsername} = storeToRefs(useUserStore());
</script>

<template>
  <section class="box" @click="$router.push({ name: 'ChatChannel' })">
    <p class="channel_name">{{ props.channels.name }}</p>
    <p class="channel_address">Location: {{ props.channels.address }}</p>
    <article class="timestamp">
      <p>Created on: {{ formatDate(props.channels.dateCreated) }}</p>
    </article>
    <article class="timestamp">
      <p>Ticket Time: {{ props.channels.expired_time }} hours</p>
    </article>
  </section>
  <button class="joinbutton" @click="getexpiretime(props.channels.name)">check remain hour: {{ expiretime }} </button>
  <p class="rejoinwarn"> You can rejoin the channel when reamin hour is less than 0.5</p>
  <section v-if="expiretime!==null && parseFloat(expiretime) < 0.5 ">
  <!-- if (parseFloat(expiretime) > 0.5) button class = "joinbutton-gray", else = "joinbutton" -->
    <button class="joinbutton" @click="rejoinchannel(props.channels.name)">rejoin</button>
  </section>
  <section v-else>
    <button class="joinbutton-gray">rejoin</button>
  </section>
</template>

<style scoped>
.box {
  /* a box for displaying all the channel information inside it */
  width: 93%;
  height: 90%;
  /* background-image: linear-gradient(to bottom, rgb(65, 129, 171) 40%, rgb(204, 224, 237) 50%, rgb(204, 224, 237) 85%); */
  /* background color with seperated two colors: top 30% dark blue and bottom 70% light blue */
  background-color: rgb(204, 224, 237);
  border-radius: 1em;
  padding: 1em;
  margin: 1em;
  display: flex;
  flex-direction: column;
}
.channel_name {
  height: 1.5em;
  width: 100%;
  font-size: 20px;
  font-weight: bold;
  margin-top: 0.1em;
  text-align: center;
  color: rgb(236, 236, 236);
  background-color: rgb(67, 120, 156);
  border-radius: 1em;
}
.channel_address {
  font-size: 20px;
  font-weight: Light;
  margin-top: 1em;
  margin-bottom: 0.1em;
  color: rgb(43, 43, 45);
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

.timestamp {
  display: flex;
  justify-content: flex-end;
  align-text: top;
  font-size: 0.9em;
  font-style: italic;
  padding: 0em;
}
.joinbutton{
  background-color: rgb(220, 96, 158);
  border-radius: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  padding: 15px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  text-align: center;
  width: 40%;
}
.rejoinwarn{
  font-size: 10px;
  font-weight: bold;
  margin-top: 1em;
  margin-left: 3em;
  margin-bottom: 0.1em;
  color: rgb(43, 43, 45);
  text-align: left;
}
.joinbutton-gray{
  border-radius: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  padding: 15px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  text-align: center;
  width: 40%;
  background-color: gray;
}
</style>
