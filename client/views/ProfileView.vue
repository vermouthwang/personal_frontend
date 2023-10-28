<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import ChannelProfileComponent from "../components/Channel/ChannelProfileComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Profile and Channels</h1>
    <section>
      <h1 v-if="isLoggedIn"></h1>
      <h1 v-else>Please login!</h1>
    </section>
    <p class="function_explanation">
      Here you will find all the channels that you have already joined.
      You need to re-join those channels after the ticket time expires.
    </p>
    <ChannelProfileComponent  />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: 40px;
  color: rgb(56, 154, 41);
}
</style>
