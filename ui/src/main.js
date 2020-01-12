import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueI18n from "vue-i18n";
import I18nMessages from "./lib/i18n/messages";
import "@/components/ui/loader";
import { WSClient } from "./lib/ws/wsclient";

Vue.config.productionTip = false;
Vue.prototype.$WSClient = new WSClient();
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en",
  messages: I18nMessages
});

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
