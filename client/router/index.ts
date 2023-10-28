import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import ChannelView from "../views/ChannelView.vue";
import CreateChannelView from "../views/CreateChannelView.vue";
import EventView from "../views/EventView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import PostView from "../views/PostView.vue";
import ProfileView from "../views/ProfileView.vue";
import SettingView from "../views/SettingView.vue";
import ChannelChat from "../components/Channel/ChannelChat.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/profile",
      name: "Profile",
      component: ProfileView,
    },
    {
      path: "/event",
      name: "Event",
      component: EventView,
      // meta: { requiresAuth: true },
    },
    {
      path: "/post",
      name: "Post",
      component: PostView,
    },
    {
      path: "/channel",
      name: "Channel",
      component: ChannelView,
    },
    {
      path: "/channel/create",
      name: "CreateChannel",
      component: CreateChannelView,
    },
    {
      path: "/channel/chat",
      name: "ChatChannel",
      component: ChannelChat,
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
