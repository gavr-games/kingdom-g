import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueI18n from "vue-i18n";
import I18nMessages from "./lib/i18n/messages";
import "@/components/ui/loader";
import "@/components/arena/loader";
import WSClient from "./lib/ws/wsclient";
import getLanguage from "./lib/concepts/lang/operations/get_lang";

Vue.config.productionTip = false;
Vue.prototype.$WSClient = WSClient;
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: getLanguage(),
  messages: I18nMessages
});

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
