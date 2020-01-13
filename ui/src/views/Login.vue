<template>
  <ui-cards-pile>
    <ui-two-pages>
      <div class="row login-row">
        <div class="column">
          <div class="forms-column">
            <div class="portal-input">
              <label for="login">{{ $t("login.login") }}</label>
              <input type="text" name="login" id="login" v-model="login" />
            </div>
            <div class="portal-input">
              <label for="pass">{{ $t("login.login") }}</label>
              <input type="password" name="pass" id="pass" v-model="pass" />
            </div>
            <a href="#" class="portal-link green-button" @click="doLogin">
              {{ $t("login.enter") }}
            </a>
            <p
              v-bind:class="['portal-error', showLoginError ? 'show' : '']"
              class="portal-error"
            >
              {{ loginError }}
            </p>
            <div class="portal-input guest-input">
              <label for="name">{{ $t("login.name") }}</label>
              <input type="text" name="name" id="name" v-model="name" />
            </div>
            <a href="#" class="portal-link green-button" @click="doGuestLogin">
              {{ $t("login.guest_enter") }}
            </a>
            <p
              v-bind:class="['portal-error', showGuestLoginError ? 'show' : '']"
              class="portal-error"
            >
              {{ guestLoginError }}
            </p>
            <router-link to="signup" class="portal-link signup-link">
              <span>{{ $t("login.want_signup") }}</span>
            </router-link>
          </div>
        </div>
        <div class="column">
          <div class="legend-column">
            <p>{{ $t("login.guest_help") }}</p>
            <a href="#" class="portal-link green-button" @click="showRules">
              {{ $t("rules.rules") }}
            </a>
            <div class="user-language">
              <a href="#" class="portal-link line" @click="setEn">
                <span>En</span>
              </a>
              |
              <a href="#" class="portal-link line" @click="setRu">
                <span>Ru</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </ui-two-pages>
    <ui-rules></ui-rules>
  </ui-cards-pile>
</template>

<script>
import { EventBus } from "../lib/event_bus";
import checkUserLocation from "../lib/concepts/user/operations/check_location";
import redirectUser from "../lib/concepts/user/operations/redirect_user";

export default {
  data() {
    return {
      login: "",
      pass: "",
      name: "",
      loginError: "Error",
      guestLoginError: "Error",
      showLoginError: false,
      showGuestLoginError: false
    };
  },
  created() {
    checkUserLocation();
    EventBus.$on("received-base-msg", this.handleMsg);
    EventBus.$on("received-user-msg", this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off("received-base-msg", this.handleMsg);
    EventBus.$off("received-user-msg", this.handleUserMsg);
  },
  methods: {
    doLogin() {
      /*this.$WSClient.sendBaseProtocolCmd({
          action: 'user_authorize',
          params: {
            login: '"' + Chars.convertChars(this.login) + '"',
            pass: '"' + this.pass.replace(new RegExp('"', 'g'), '\\"') + '"'
          }
        })*/
    },
    doGuestLogin() {
      /*this.$WSClient.sendBaseProtocolCmd({
          action: 'guest_user_authorize',
          params: {
            name: '"' + Chars.convertChars(this.name) + '"'
          }
        })*/
    },
    handleMsg(payload) {
      console.log(payload);
    },
    handleUserMsg(payload) {
      if (payload["action"] == "check_location") {
        redirectUser(this, payload["data"]);
      }
    },
    setEn() {
      this.setLang("en");
    },
    setRu() {
      this.setLang("ru");
    },
    setLang(language) {
      this.$root.$i18n.locale = language;
      this.showLoginError = false;
      this.showGuestLoginError = false;
      this.$forceUpdate();
    },
    handleSuccesfullLogin(payload) {
      this.showLoginError = false;
      this.showGuestLoginError = false;
      console.log(payload);
      //authenticateUser(this, payload.data_result);
      //redirectUser(this, payload.data_result);
    },
    showRules() {
      EventBus.$emit("show-rules");
    }
  }
};
</script>

<style lang="scss">
.legend-column {
  padding-left: 70px;
  p {
    margin-top: 10px;
    margin-left: 10px;
    height: 240px;
    overflow: hidden;
  }
  .user-language {
    margin-top: 20px;
    text-align: right;
  }
}
.forms-column {
  padding-top: 10px;
  padding-right: 55px;
  .guest-input {
    margin-top: 30px;
  }
  .signup-link {
    margin-top: 30px;
  }
}
</style>
