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
              <label for="pass">{{ $t("login.password") }}</label>
              <input type="password" name="pass" id="pass" v-model="pass" />
            </div>
            <div class="portal-input">
              <label for="repeat-pass">{{ $t("signup.repeat_pass") }}</label>
              <input
                type="password"
                name="repeat-pass"
                id="repeat-pass"
                v-model="repeat_pass"
              />
            </div>
            <div class="portal-input">
              <label for="email">Email</label>
              <input type="email" name="email" id="email" v-model="email" />
            </div>
            <a href="#" class="portal-link green-button" @click="doSignup">
              {{ $t("signup.do_signup") }}
            </a>
            <p
              v-bind:class="['portal-error', showError ? 'show' : '']"
              class="portal-error"
            >
              {{ error }}
            </p>
            <router-link to="/" class="portal-link signup-link">
              <span>{{ $t("common.back") }}</span>
            </router-link>
          </div>
        </div>
        <div class="column">
          <div class="legend-column">
            <p>{{ $t("signup.help") }}</p>
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
import setLanguage from "../lib/concepts/lang/operations/set_lang";
import loginUser from "../lib/concepts/user/operations/login";
import checkUserLocation from "../lib/concepts/user/operations/check_location";
import redirectUser from "../lib/concepts/user/operations/redirect_user";

export default {
  data() {
    return {
      login: "",
      pass: "",
      repeat_pass: "",
      email: "",
      error: "Error",
      showError: false
    };
  },
  created() {
    checkUserLocation();
    EventBus.$on("received-base-msg", this.handleMsg);
    EventBus.$on("received-base-error", this.handleError);
    EventBus.$on("received-user-msg", this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off("received-base-msg", this.handleMsg);
    EventBus.$off("received-base-error", this.handleError);
    EventBus.$off("received-user-msg", this.handleUserMsg);
  },
  methods: {
    doSignup() {
      if (this.pass != this.repeat_pass) {
        this.error = this.$t("signup.pass_mismatch");
        this.showError = true;
        return;
      }
      if (this.pass == "" || this.login == "" || this.repeat_pass == "" || this.email == "") {
        this.error = this.$t("login.fields_blank");
        this.showError = true;
        return;
      }
      this.$WSClient.sendMsg("base", {
        action: "signup",
        data: {
          username: this.login,
          password: this.pass,
          email: this.email
        }
      });
    },
    handleMsg(payload) {
      if (payload["action"] == "signup") {
        this.showError = false;
        loginUser(payload["data"]["token"]);
      }
    },
    handleUserMsg(payload) {
      if (payload["action"] == "check_location") {
        redirectUser(this, payload["data"]);
      }
    },
    handleError(payload) {
      if (payload["action"] == "signup") {
        this.error = this.$t(`errors.${payload["code"]}`);
        this.showError = true;
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
      setLanguage(language);
      this.showError = false;
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