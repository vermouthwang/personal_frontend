import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useEventStore = defineStore(
  "event",
  () => {
    const currentEventname = ref("");
    const resetStore = () => {
      currentEventname.value = "";
    };

    const createEvent = async (eventname: string, eventinfo: string, address: string) => {
      await fetchy("/api/event", "POST", {
        body: { eventname, eventinfo, address },
      });
    };
    return {
      currentEventname,
      resetStore,
      createEvent,
    };
  },
  { persist: true },
);
