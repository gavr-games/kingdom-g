<template>
  <div id="game-cont">
    <div id="fps">0</div>
    <div id="playerslist-cont" class="rpgui-container framed-golden-2">
      <div class="rpgui-content">
        <h3>Players</h3>
        <div
          class="player"
          v-for="player in players"
          v-bind:key="player.user_id"
        >
          <p v-bind:class="{ active: player.active }">
            {{ player.username }} ({{ player.gold }})
          </p>
        </div>
      </div>
    </div>
    <div
      id="object-popup-cont"
      v-show="showObjectPopup"
      class="rpgui-container framed-golden-2"
    >
      <div class="rpgui-content">
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
    </div>
    <div
      id="actions-panel-cont"
      v-if="showActionsPanel"
      class="rpgui-container framed-golden-2"
    >
      <div class="rpgui-content">
        <h3>Actions</h3>
        <div
          class="action"
          v-for="action in selectedObjectState.actions"
          v-bind:key="action"
        >
          <button
            type="button"
            class="rpgui-button"
            @click="handleAction(action)"
            v-if="showAction(action)"
          >
            <p>{{ action }}</p>
          </button>
        </div>
        <div>
          <button type="button" class="rpgui-button down" @click="cancelAction">
            <p>{{ $t("common.cancel") }}</p>
          </button>
        </div>
      </div>
    </div>
    <div id="levelup-panel-cont" v-if="showLevelupPanel">
      <h3>Levelup</h3>
      <div>
        <a href="#" class="green-button" @click="handleLevelup('attack')">
          attack
        </a>
      </div>
      <div>
        <a href="#" class="green-button" @click="handleLevelup('health')">
          health
        </a>
      </div>
      <div>
        <a href="#" class="green-button" @click="handleLevelup('moves')">
          moves
        </a>
      </div>
      <div>
        <a href="#" class="red-button" @click="cancelLevelup">
          {{ $t("common.cancel") }}
        </a>
      </div>
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
      showObjectPopup: true,
      selectedObjectState: null,
      showActionsPanel: false,
      showLevelupPanel: false
    };
  },
  created() {
    this.getGame();
    EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
    EventBus.$on("command-set-active-players", this.setPlayers);
    EventBus.$on("pointer-over-unit", this.setPopupObject);
    EventBus.$on("pointer-out-unit", this.hidePopupObject);
    EventBus.$on("pointer-over-building", this.setPopupObject);
    EventBus.$on("pointer-out-building", this.hidePopupObject);
    EventBus.$on("unit-selected", this.setActionsPanel);
    EventBus.$on("unit-deselected", this.hideActionsPanel);
    EventBus.$on("click-action", this.handleClickAction);
  },
  mounted() {
    this.canvas = document.getElementById("game-canvas");
  },
  beforeDestroy() {
    EventBus.$off(`received-user:${getId()}-msg`, this.handleUserMsg);
    EventBus.$off("command-set-active-players", this.setPlayers);
    EventBus.$off("pointer-over-unit", this.setPopupObject);
    EventBus.$off("pointer-out-unit", this.hidePopupObject);
    EventBus.$off("pointer-over-building", this.setPopupObject);
    EventBus.$off("pointer-out-building", this.hidePopupObject);
    EventBus.$off("unit-selected", this.setActionsPanel);
    EventBus.$off("unit-deselected", this.hideActionsPanel);
    EventBus.$off("click-action", this.handleClickAction);
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
        id = id[0];
        let enginePlayer = window.client.api.get_player(id);
        let activePlayerIds = window.client.api.get_active_players();
        enginePlayer.active = activePlayerIds.includes(id);
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
    },
    setActionsPanel(objectObserver) {
      this.selectedObjectState = objectObserver.state;
      this.showActionsPanel = true;
    },
    hideActionsPanel() {
      this.selectedObject = null;
      this.showActionsPanel = false;
    },
    handleAction(action) {
      EventBus.$emit("click-action", action, this.selectedObjectState);
    },
    cancelAction() {
      EventBus.$emit("cancel-action");
    },
    showAction(action) {
      if (action != "levelup") {
        return true;
      }
      return this.selectedObjectState.canLevelUp;
    },
    handleClickAction(action) {
      if (action === "levelup") {
        this.showLevelupPanel = true;
      }
    },
    handleLevelup(stat) {
      this.$WSClient.sendMsg(`game:${this.currentGameId}`, {
        action: "perform_action",
        data: [
          {
            action: "levelup",
            parameters: {
              "obj-id": this.selectedObjectState.id,
              stat: stat
            }
          }
        ]
      });
      this.cancelLevelup();
    },
    cancelLevelup() {
      this.showLevelupPanel = false;
    }
  }
};
</script>

<style lang="scss">
#fps {
  position: absolute;
  background-color: black;
  border: 2px solid red;
  text-align: center;
  font-size: 16px;
  color: white;
  top: 15px;
  right: 10px;
  width: 60px;
  height: 20px;
}
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
  font-family: "Press Start 2P", cursive;
  font-size: 12px;
  position: absolute;
  left: 10px;
  bottom: 10px;
  color: #fff;
  text-shadow: -2px 0 #000, 0 2px #000, 2px 0 #000, 0 -2px #000;
  font-size: 1em;
  #object-popup-canvas {
    width: 100px;
    height: 100px;
  }
}
#playerslist-cont {
  font-family: "Press Start 2P", cursive;
  font-size: 12px;
  position: absolute;
  top: 10px;
  left: 10px;
  h3 {
    color: white;
  }
  .player {
    .active {
      color: #ff0;
    }
  }
}
#actions-panel-cont,
#levelup-panel-cont {
  position: absolute;
  bottom: 10px;
  right: 10px;
  h3 {
    color: white;
  }
  button {
    width: 100%;
  }
}
</style>
