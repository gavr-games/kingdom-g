<template>
  <div id="arena-create-game">
    <div class="heading">- {{ $t("arena.creategame.create_game") }} -</div>
    <div class="input">
      <label>{{ $t("arena.creategame.game_name") }}*</label>
      <input type="text" class="arena-input" v-model="name" />
    </div>
    <div class="input">
      <label>{{ $t("arena.creategame.mode") }}</label>
      <select v-model="modeId">
        <option
          v-for="mode in gameModes"
          v-bind:value="mode.id"
          v-bind:key="mode.id"
        >
          {{ mode.name }}
        </option>
      </select>
    </div>
    <div class="input">
      <label>{{ $t("arena.creategame.turn_time") }}</label>
      <select v-model="turnTime">
        <option value="0">{{ $t("arena.creategame.no_limit") }}</option>
        <option value="60">1 {{ $t("arena.creategame.minute") }}.</option>
        <option value="120">2 {{ $t("arena.creategame.minute") }}.</option>
        <option value="180">3 {{ $t("arena.creategame.minute") }}.</option>
        <option value="240">4 {{ $t("arena.creategame.minute") }}.</option>
        <option value="300">5 {{ $t("arena.creategame.minute") }}.</option>
      </select>
    </div>
    <div class="input">
      <label>{{ $t("arena.creategame.password") }}</label>
      <input type="password" class="arena-input" v-model="password" />
    </div>
    <div class="input">
      <label>{{ $t("arena.creategame.repeat_password") }}</label>
      <input type="password" class="arena-input" v-model="confirmPassword" />
    </div>
    <a href="#" class="green-button" @click="createGame">
      {{ $t("arena.creategame.create") }}
    </a>
    <p v-bind:class="['error', showError ? 'show' : '']">{{ errorText }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gameModes: [],
      name: "",
      modeId: null,
      turnTime: "0",
      password: "",
      confirmPassword: "",
      showError: false,
      errorText: ""
    };
  },
  created() {},
  beforeDestroy() {},
  methods: {
    createGame() {
      this.showError = false;
      if (this.name == "") {
        this.errorText = this.$t("login.fields_blank");
        this.showError = true;
        return;
      }
      if (this.password != "" && this.password != this.confirmPassword) {
        this.errorText = this.$t("signup.pass_mismatch");
        this.showError = true;
        return;
      }
      let pass = "null";
      if (this.password != "") {
        pass = '"' + this.password.replace(new RegExp('"', "g"), '\\"') + '"';
      }
      // Send create game
      console.log(pass);
    }
  }
};
</script>

<style lang="scss">
#arena-create-game {
  .heading {
    margin-bottom: 30px;
  }
  .input {
    display: flex;
    flex-direction: row;
    font-size: 18px;
    label {
      color: #dae4f0;
      width: 200px;
      text-align: right;
      margin-right: 10px;
    }
  }
  .green-button {
    margin-top: 20px;
  }
  .error {
    color: red;
    text-align: center;
    margin: 0px;
    visibility: hidden;
    &.show {
      visibility: visible;
    }
  }
}
</style>
