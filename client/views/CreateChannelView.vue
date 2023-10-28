<script setup lang="ts">
import CreateChannelComonent from "@/components/Channel/CreateChannelComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

// const created_channels = ref<Array<Record<string, string>>>([]);
// const getUsercreatedChannel = async () => {
//   let usercreated_channel;
//   try {
//     usercreated_channel = await fetchy("/api/channel/creator", "GET");
//   } catch (_) {
//     return;
//   }
//   created_channels.value = usercreated_channel;
// };
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Create Your own channel</h1>
      <h1 v-else>Please login!</h1>
      <p class="function_explanation">
        Create your own location based channel for special event/ class activities/ community group/ business service...<br />
        To create a channel, you have to provide a unique name for you channel, for example: "6.1040 Project Show".
        <br />
        You should also provide an address for your channel. And only the user who is near the address can join your channel.
        <br />
        Ticket Time is the time limitation of joining your channel. Users in your channel need to revalidate their location to stay in your channel.
      </p>
    </section>
    <CreateChannelComonent />
    <br />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: 40px;
  color: rgb(56, 154, 41);
}
</style>
