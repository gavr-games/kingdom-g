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
  created() {},
  beforeDestroy() {},
  methods: {
    exitGame() {
      // Send exit game
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
