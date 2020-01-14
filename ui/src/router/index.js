import Vue from "vue";
import VueRouter from "vue-router";
import isUserLoggedIn from "../lib/concepts/user/operations/is_logged_in";

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
  },
  {
    path: "/arena",
    name: "arena",
    component: () => {
      return import("../views/Arena.vue");
    },
    meta: { requiresAuth: true }
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    !isUserLoggedIn()
  ) {
    return next({
      path: "/",
      query: { ...to.query }
    });
  }

  next();
});

export default router;
