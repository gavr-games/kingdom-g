<template>
  <div id="arena-game">
    <div class="heading">- {{ game.title }} -</div>
    <div class="cols">
      <div id="players">
        Players:
        <div
          class="player"
          v-for="player in game.players"
          v-bind:key="player.id"
        >
          {{ player.username }}
        </div>
      </div>
    </div>
    <a href="#" class="green-button" @click="startGame">
      {{ $t("arena.game.start") }}
    </a>
    <a href="#" class="red-button" @click="exitGame">
      {{ $t("arena.game.exit") }}
    </a>
  </div>
</template>

<script>
import { EventBus } from "../../lib/event_bus";
import getId from "../../lib/concepts/user/operations/get_id";

export default {
  data() {
    return {
      currentGameId: null,
      game: {},
      createGameFeatures: [],
      features: [],
      players: []
    };
  },
  created() {
    this.getGame();
    EventBus.$on("received-arena-msg", this.handleArenaMsg);
    EventBus.$on(`received-user:${getId()}-msg`, this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off("received-arena-msg", this.handleArenaMsg);
    EventBus.$off(`received-user:${getId()}-msg`, this.handleUserMsg);
  },
  methods: {
    getGame() {
      this.$WSClient.sendMsg(`user:${getId()}`, {
        action: "get_my_game",
        data: {}
      });
    },
    startGame() {
      this.$WSClient.sendMsg("arena", {
        action: "start_game",
        data: {
          game_id: this.currentGameId
        }
      });
    },
    exitGame() {
      this.$WSClient.sendMsg("arena", {
        action: "exit_game",
        data: {
          game_id: this.currentGameId
        }
      });
    },
    handleArenaMsg(payload) {
      //TODO: refactor this not to refresh the whole game but just add player or remove
      if (
        payload.action == "command" &&
        (payload.data.command == "add_user_to_game" ||
          payload.data.command == "remove_user_from_game") &&
        payload.data.params.game_id == this.currentGameId
      ) {
        this.getGame();
      }
    },
    handleUserMsg(payload) {
      if (payload["action"] == "get_my_game") {
        this.game = payload.data;
        this.currentGameId = payload.data.id;
      }
    }
  }
};
</script>

<style lang="scss">
#arena-game {
  .cols {
    display: flex;
    flex-direction: row;
  }
  .red-button {
    margin-top: 20px;
  }
  #players {
    color: white;
  }
}
</style>
