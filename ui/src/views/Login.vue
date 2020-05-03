<template>
  <ui-cards-pile>
    <ui-two-pages>
      <div class="row login-row">
        <div class="column">
          <div class="forms-column">
            <div class="portal-input">
              <label for="login">Email</label>
              <input type="text" name="login" id="login" v-model="login" />
            </div>
            <div class="portal-input">
              <label for="pass">{{ $t("login.password") }}</label>
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
import loginUser from "../lib/concepts/user/operations/login";
import getId from "../lib/concepts/user/operations/get_id";

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
    EventBus.$on("received-base-error", this.handleError);
    if (getId() !== null) {
      EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
    }
  },
  beforeDestroy() {
    EventBus.$off("received-base-msg", this.handleMsg);
    EventBus.$off("received-base-error", this.handleError);
    EventBus.$off(`received-user:${getId()}-msg`, this.handleUserMsg);
  },
  methods: {
    doLogin() {
      this.showLoginError = false;
      this.showGuestLoginError = false;
      if (this.pass == "" || this.login == "") {
        this.loginError = this.$t("login.fields_blank");
        this.showLoginError = true;
        return;
      }
      this.$WSClient.sendMsg("base", {
        action: "login",
        data: {
          password: this.pass,
          email: this.login
        }
      });
    },
    doGuestLogin() {
      // Send guest login
    },
    handleMsg(payload) {
      if (payload["action"] == "login") {
        this.showLoginError = false;
        this.showGuestLoginError = false;
        loginUser(payload["data"]);
        EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
      }
    },
    handleError(payload) {
      if (payload["action"] == "login") {
        this.loginError = this.$t(`errors.${payload["code"]}`);
        this.showLoginError = true;
      }
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
