<template>
  <div id="game-cont">
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <a href="#" @click="enterFullscreen">Fullscreen</a>
  </div>
</template>

<script>
import GameController from "@/lib/game/game_controller";
import { EventBus } from "@/lib/event_bus";
import getId from "@/lib/concepts/user/operations/get_id";

export default {
  name: "game",
  data() {
    return {
      currentGameId: null,
      game: {}
    };
  },
  created() {
    this.getGame();
    EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off(`received-user:${getId()}-msg`, this.handleUserMsg);
    if (this.currentGameId !== null) {
      EventBus.$off(
        `received-game:${this.currentGameId}-msg`,
        this.handleGameMsg
      );
    }
  },
  methods: {
    enterFullscreen() {
      GameController.enterFullscreen();
    },
    getGame() {
      this.$WSClient.sendMsg(`user:${getId()}`, {
        action: "get_my_game",
        data: {}
      });
    },
    handleUserMsg(payload) {
      switch (payload["action"]) {
        case "get_my_game":
          this.game = payload.data;
          this.currentGameId = payload.data.id;
          EventBus.$on(
            `received-game:${this.currentGameId}-msg`,
            this.handleGameMsg
          );
          this.$WSClient.joinChannel(`game:${this.currentGameId}`);
          break;
        case "game_state":
          window.client.api.init_game(payload.data.game_state);
          GameController.init();
          break;
      }
    },
    handleGameMsg(payload) {
      console.log(payload);
    }
  }
};
</script>
