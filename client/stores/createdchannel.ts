import { defineStore } from "pinia";
import { ref } from "vue";

// export a store that store the channel created by the user
export const useChannelStor = defineStore("channel", () => {
  const currentUser = ref("");
  const currentChannel_name = ref("");
});
