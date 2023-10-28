<script setup lang="ts">
import ChannelmenuComponent from "@/components/Channel/ChannelmenuComponent.vue";
import CreateChannelForm from "@/components/Channel/CreateChannelForm.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
const created_channels = ref<Array<Record<string, string>>>([]);

const getUsercreatedChannel = async () => {
  let usercreated_channel;
  try {
    usercreated_channel = await fetchy("/api/channel/creator", "GET");
    console.log(created_channels.value);
  } catch (_) {
    return;
  }
  created_channels.value = usercreated_channel;
};


onBeforeMount(async () => {
  await getUsercreatedChannel();
  loaded.value = true;
});
</script>

<template>
  <main>
    <CreateChannelForm @refreshChannel="getUsercreatedChannel" />
    <!-- <ChannelMenu /> -->
    <section v-if="created_channels.length !== 0">
      <h2>The channels you have created</h2>
      <article v-for="created_channel in created_channels" :key="created_channel._id">
        <ChannelmenuComponent :channels="created_channel" />
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
  text-align: start;
  margin: 30px 0px 30px 30px;
  font-size: 30px;
  color: rgb(56, 154, 41);
}
</style>
