<script setup lang="ts">
import FindChannelComponent from "@/components/Channel/FindChannelComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1></h1>
    <section>
      <h1 v-if="isLoggedIn">Discover Channel Around You</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <p class="function_explanation">
      There are a lot of channel created by local group and community members. You can join the channel near you to acquire for real-time help or share your thoughts with people around you. To join a
      channel you have to be closed enough to the location provided by the channel. Each channel has a ticket time, which is the time that you are allowed to stay in the channel. After the ticket
      time, you have to revalidate your location to stay in the channel.
    </p>
    <!-- link the button to the profile page -->
    <button class="joinbutton" @click="$router.push({ name: 'Profile' })">
      See the channels you already in here
    </button>
    <FindChannelComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: 40px;
  color: rgb(56, 154, 41);
}

.joinbutton{
  /* putthebutton at the center of the page width */
  display: block;
  margin: 0 auto;
  border: none;
  background-color: rgb(220, 96, 158);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
  transition: 0.3s ease-in-out;
  /* 
  
  
  margin-left: 20px;


  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;

  text-align: center;
  width: 40%; */
}
</style>
