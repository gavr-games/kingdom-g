<template>
  <div id="game-cont">
    <canvas id="game-canvas" width="1000" height="600"></canvas>
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
      game: {},
      canvas: null
    };
  },
  created() {
    this.getGame();
    EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
  },
  mounted() {
    this.canvas = document.getElementById("game-canvas");
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
          this.canvas.width = document.body.clientWidth;
          this.canvas.height = document.body.clientHeight;
          GameController.init(this.game, getId());
          break;
      }
    },
    handleGameMsg(payload) {
      console.log(payload);
    }
  }
};
</script>
