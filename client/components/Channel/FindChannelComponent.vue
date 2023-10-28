<script setup lang="ts">
import ChannelmenuComponent from "@/components/Channel/ChannelmenuComponent.vue";
// import CreateChannelForm from "@/components/Channel/CreateChannelForm.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

let channels = ref<Array<Record<string, string>>>([]);
const getChannel = async (channelname?: string) => {
  // get all channels if not specify channelname
  if (channelname === null || channelname === undefined) {
    let all_channels;
    try {
      all_channels = await fetchy("/api/channel/all", "GET");
    } catch (_) {
      return;
    }
    channels.value = all_channels;
  } else {
    return;
    // let searched_channel;
    // try {
    //   searched_channel = await fetchy("/api/channel", "GET", { name: channelname });
    // } catch (_) {
    //   return;
    // }
    // channels.value = searched_channel;
  }
};
let loaded = ref(false);
onBeforeMount(async () => {
  await getChannel();
  loaded.value = true;
});

const joinchannel = async (name: string) => {
  try {
    await fetchy("/api/channel/join/location", "PUT", {body:{ channelname: name }});
  } catch (_) {
    return;
  }
  console.log("join")
  // await getChannel();
};


</script>

<template>
  <main>
    <!-- <ChannelMenu /> -->
    <br />
    <section v-if="loaded && channels.length !== 0">
      <h2>The channels in Boston Area</h2>
      <article class="channelmenu" v-for="channel in channels" :key="channel._id">
        <ChannelmenuComponent :channels="channel" />
        <button class="joinbutton" @click="joinchannel(channel.name)">Join this channel</button>
        <br />
      </article>
    </section>
    <br />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: 40px;
  color: rgb(56, 154, 41);
}
h2 {
  text-align: center;
  margin: 30px 0px 30px 30px;
  font-size: 30px;
  color: rgb(220, 96, 158);
}

.channelmenu{

  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  margin-bottom: 30px;
  margin-left: 30px;
  width: 95%;
  padding: 20px 0px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
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
</style>
