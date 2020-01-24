<template>
  <div id="arena-cont">
    <div id="arena-windows-wrapper">
      <div id="arena-left-window">
        <div class="arena-window-container">
          <arena-players-list></arena-players-list>
          <arena-chat></arena-chat>
        </div>
      </div>
      <div id="arena-right-window">
        <div id="arena-content-window">
          <component :is="currentContentComponent"></component>
        </div>
        <div id="arena-main-menu">
          <div
            v-bind:class="[
              'icon',
              'newgame',
              currentGameId === null ? '' : 'active'
            ]"
            @click="showCreateGame"
          ></div>
          <div class="icon games" @click="showGamesList"></div>
          <div class="icon profile" @click="showMyProfile"></div>
          <div class="icon rules" @click="showRules"></div>
        </div>
      </div>
    </div>
    <ui-rules></ui-rules>
    <arena-profile></arena-profile>
  </div>
</template>

<script>
import { EventBus } from "../lib/event_bus";
import redirectUser from "../lib/concepts/user/operations/redirect_user";
import checkUserLocation from "../lib/concepts/user/operations/check_location";
//import getMyId from "../lib/concepts/user/get_my_id";
import logout from "../lib/concepts/user/operations/logout";
//import processCommands from "../lib/concepts/arena/process_commands";

export default {
  data() {
    return {
      currentGameId: null,
      currentContentComponent: "arena-games-list"
    };
  },
  created() {
    checkUserLocation(this);
    this.$WSClient.sendMsg("user", {
      action: "get_my_game",
      data: {}
    });
    EventBus.$on("received-arena-msg", this.handleArenaMsg);
    EventBus.$on("received-arena-error", this.handleArenaError);
    EventBus.$on("received-user-msg", this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off("received-arena-msg", this.handleArenaMsg);
    EventBus.$off("received-arena-error", this.handleArenaError);
    EventBus.$off("received-user-msg", this.handleUserMsg);
  },
  methods: {
    handleArenaMsg(payload) {
      if (
        payload["action"] == "create_game" ||
        payload["action"] == "join_game"
      ) {
        this.showGame(payload.data.id);
      }
    },
    handleArenaError(payload) {
      alert(this.$t(`errors.${payload["code"]}`));
    },
    handleUserMsg(payload) {
      if (payload["action"] == "check_location") {
        redirectUser(this, payload["data"]);
      }
      if (payload["action"] == "get_my_game") {
        this.showGame(payload.data.id);
      }
    },
    showMyProfile() {
      this.currentContentComponent = "arena-my-profile";
    },
    showGamesList() {
      this.currentContentComponent = "arena-games-list";
    },
    showGame(game_id) {
      if (game_id !== undefined) {
        this.currentGameId = game_id;
        this.currentContentComponent = "arena-game";
      }
    },
    showCreateGame() {
      if (this.currentGameId === null) {
        this.currentContentComponent = "arena-create-game";
      } else {
        this.currentContentComponent = "arena-game";
      }
    },
    showRules() {
      EventBus.$emit("show-rules");
    },
    goToLogin() {
      logout();
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss">
#arena-cont {
  width: 100%;
  min-height: 100%;
  background: url("../assets/arena_background.jpg") center;
  display: flex;
  justify-content: center;
  align-items: center;
}
#arena-windows-wrapper {
  width: 1030px;
  height: 570px;
  margin-left: 10px;
  margin-top: 40px;
  display: flex;
  flex-direction: row;
}
#arena-left-window {
  width: 420px;
  height: 570px;
  background: url("../assets/arena_left_window_background.png") center no-repeat;
  display: flex;
  flex-direction: column;
}
#arena-right-window {
  width: 610px;
  height: 570px;
  background: url("../assets/arena_right_window_background.png") center
    no-repeat;
  display: flex;
  flex-direction: row;
}
#arena-content-window {
  width: 400px;
  margin-top: 70px;
  margin-bottom: 65px;
  margin-left: 60px;
}
#arena-main-menu {
  margin-left: auto;
  margin-top: 45px;
  width: 135px;
  .icon {
    width: 82px;
    height: 82px;
    opacity: 0.9;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
  .newgame {
    background: url("../assets/arena_icon_newgame.png") center no-repeat;
    &.active {
      background: url("../assets/arena_icon_newgame.png") center no-repeat,
        radial-gradient(50% 50%, white, rgba(255, 0, 0, 0));
    }
  }
  .games {
    background: url("../assets/arena_icon_games.png") center no-repeat;
  }
  .profile {
    background: url("../assets/arena_icon_profile.png") center no-repeat;
  }
  .rules {
    background: url("../assets/arena_icon_rules.png") center no-repeat;
  }
}
</style>
