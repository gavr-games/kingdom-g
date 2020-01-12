import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => {
      return import("../views/Login.vue");
    }
  },
  {
    path: "/signup",
    name: "signup",
    component: () => {
      return import("../views/Signup.vue");
    }
  },
  {
    path: "/game",
    name: "game",
    component: () => {
      return import("../views/Game.vue");
    },
    meta: { requiresAuth: true }
  }
];

const router = new VueRouter({
  routes
});

export default router;
