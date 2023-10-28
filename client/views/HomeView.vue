<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main class="colorful">
    <br />
    <br />
    <section class="transparentbox">
      <section>
        <br />
        <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
        <h1 v-else>Please login!</h1>
      </section>
      <br />
      <section>
        <p class="introtext">
          Localink is a location-based social media that allows you to connect with people physically around you. You can join the channel near you to acquire real-time help or share your thoughts
          with people around you.
        </p>
        <br />
        <br />
        <p class="quickstart">Now, let's have a quick start!</p>
      </section>
      <!-- two button placed parrally -->
      <br />
      <br />
      <section>
        <div class="two-button-menu">
          <button class="button search" @click="$router.push({ name: 'CreateChannel' })">
            <p class="button-detail">Are you going to hold a party or event? Want to create a location & time limited channel for your event?</p>
            <p class="button-title">Create Your Own Channel -></p>
          </button>
          <button class="button create" @click="$router.push({ name: 'Channel' })">
            <p class="button-detail">There are a lot of channel created by local group and community members. Try to join the channel near you.</p>
            <p class="button-title">Search Around Channel -></p>
          </button>
        </div>
      </section>
      <br />
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  /* italic */
  font-style: italic;
  /* fancy font style */
  font-family: system-ui, cursive;
  font-size: 45px;
  color: rgb(56, 154, 41);
}

p {
  text-align: center;
}
.transparentbox {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  margin: 0 auto;
  width: 90%;
  padding: 20px 0px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}
.introtext {
  width: 50%;
  font-size: 19px;
  margin: 0 auto;
  color: rgb(56, 154, 41);
}

.quickstart {
  width: 50%;
  font-size: 15px;
  margin: 0 auto;
}

.button {
  /* fix width */
  /* width: 20%; */
  padding: 20px 0px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  text-align: right;
  color: rgb(173, 102, 102);
  /* width: 30; */
  /* fix width button */
  width: 40%;
}

.button.search {
  /* seperate background color into two (top and bottom) */
  background-image: linear-gradient(to bottom, rgb(204, 224, 237) 55%, rgb(65, 129, 171) 50%);
  /* background-color: rgb(204, 224, 237); */
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

.button.search:hover {
  background-color: #45a047;
}

.button.create {
  background-image: linear-gradient(to bottom, rgb(238, 196, 214) 55%, rgb(220, 96, 158) 50%);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

.button.create:hover {
  background-color: #f73570;
}

.two-button-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3em;
}

.button-detail {
  font-size: 15px;
  /* light weight */
  font-weight: 500;
  color: rgb(39, 49, 44);
  text-align: center;
  margin: 10px 15px 30px 15px;
  cursor: pointer;
  width: 90%;
}

.button-title {
  color: rgb(254, 252, 252);
  text-align: center;
  font-size: 27px;
  margin: 0px 0px 0px 0px;
  /* to the button */
  cursor: pointer;
  width: 100%;
  /* text-decoration-line: underline; */
  text-decoration-thickness: 3px;
}

.colorful {
  /* extend to the whole screen height */
  height: 90vh;
  /* background-color: #8cbd8d; */
  /* background-size: cover; */
  background-image: url("../assets/images/backgroundhome.png");
  /* make the background image extend to the whole page */
  background-size: 100% 100%;
}
</style>
