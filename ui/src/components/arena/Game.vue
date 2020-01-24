<template>
  <div id="arena-game">
    <div class="heading">- {{ game.title }} -</div>
    <div class="cols">
      <div id="features">
        <div class="feature" v-for="feature in features" v-bind:key="feature.feature_id">
          <div v-if="feature.feature_type == 'bool'">
            {{ findCreateGameFeature(feature.feature_id).name }}
          </div>
        </div>
      </div>
    </div>
    <a href="#" class="red-button" @click="exitGame">
      {{ $t("arena.game.exit") }}
    </a>
  </div>
</template>

<script>
import { EventBus } from "../../lib/event_bus";

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
    this.$WSClient.sendMsg("user", {
      action: "get_my_game",
      data: {}
    });
    EventBus.$on("received-arena-msg", this.handleArenaMsg);
    EventBus.$on("received-user-msg", this.handleUserMsg);
  },
  beforeDestroy() {
    EventBus.$off("received-arena-msg", this.handleArenaMsg);
    EventBus.$off("received-user-msg", this.handleUserMsg);
  },
  methods: {
    exitGame() {
      // Send exit game
    },
    handleArenaMsg(payload) {
      console.log(payload);
    },
    handleUserMsg(payload) {
      if (payload["action"] == "get_my_game") {
        this.game = payload.data;
        this.currentGameId = payload.data.id;
      }
    },
    findCreateGameFeature(featureId) {
      return this.createGameFeatures.find(
        f => parseInt(f.id) === parseInt(featureId)
      );
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
}
</style>
