<template>
  <div id="game-cont">
    <div id="playerslist-cont">
      <h3>Players</h3>
      <div class="player" v-for="player in players" v-bind:key="player.user_id">
        <p v-bind:class="{ active: player.active }">
          {{ player.username }} ({{ player.gold }})
        </p>
      </div>
    </div>
    <div id="object-popup-cont" v-show="showObjectPopup">
      <canvas id="object-popup-canvas"></canvas>
      <table v-if="popupObject !== null && popupObject.objectClass == 'unit'">
        <tr>
          <td>Type</td>
          <td>{{ popupObject.type }}</td>
        </tr>
        <tr>
          <td>Level</td>
          <td>{{ popupObject.level }}</td>
        </tr>
        <tr>
          <td>Health</td>
          <td>{{ popupObject.health }}/{{ popupObject.maxHealth }}</td>
        </tr>
        <tr>
          <td>Moves</td>
          <td>{{ popupObject.moves }}/{{ popupObject.maxMoves }}</td>
        </tr>
      </table>

      <table
        v-if="popupObject !== null && popupObject.objectClass == 'building'"
      >
        <tr>
          <td>Type</td>
          <td>{{ popupObject.type }}</td>
        </tr>
        <tr>
          <td>Health</td>
          <td>{{ popupObject.health }}/{{ popupObject.maxHealth }}</td>
        </tr>
      </table>
    </div>
    <canvas id="game-canvas"></canvas>
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
      canvas: null,
      players: [],
      popupObject: null,
      showObjectPopup: true
    };
  },
  created() {
    this.getGame();
    EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
    EventBus.$on("command-set-active-player", this.setPlayers);
    EventBus.$on("pointer-over-unit", this.setPopupObject);
    EventBus.$on("pointer-out-unit", this.hidePopupObject);
    EventBus.$on("pointer-over-building", this.setPopupObject);
    EventBus.$on("pointer-out-building", this.hidePopupObject);
  },
  mounted() {
    this.canvas = document.getElementById("game-canvas");
  },
  beforeDestroy() {
    EventBus.$off(`received-user:${getId()}-msg`, this.handleUserMsg);
    EventBus.$off("command-set-active-player", this.setPlayers);
    EventBus.$off("pointer-over-unit", this.setPopupObject);
    EventBus.$off("pointer-out-unit", this.hidePopupObject);
    EventBus.$off("pointer-over-building", this.setPopupObject);
    EventBus.$off("pointer-out-building", this.hidePopupObject);
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
          GameController.init(this.game, getId());
          this.setPlayers();
          this.showObjectPopup = false;
          break;
      }
    },
    handleGameMsg(payload) {
      console.log(payload);
    },
    setPlayers() {
      this.players = window.client.api.get_player_ids().map(id => {
        let enginePlayer = window.client.api.get_player(id);
        let activePlayerId = window.client.api.get_active_player();
        enginePlayer.active = id === activePlayerId;
        let gamePlayer = this.game.players.find(p => p.id === id);
        return {
          ...enginePlayer,
          ...gamePlayer
        };
      });
    },
    setPopupObject(object) {
      this.popupObject = object.state;
      this.showObjectPopup = true;
    },
    hidePopupObject() {
      this.popupObject = null;
      this.showObjectPopup = false;
    }
  }
};
</script>

<style lang="scss">
#game-cont {
  width: 100%;
  height: 100%;
}
#game-canvas {
  width: 100%;
  height: 100%;
  align-self: center;
  justify-self: center;
}
#object-popup-cont {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  #object-popup-canvas {
    width: 100px;
    height: 100px;
  }
}
#playerslist-cont {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  h3 {
    color: white;
  }
  .player {
    color: grey;
    .active {
      color: white;
    }
  }
}
</style>
