<template>
  <div id="game-cont">
    <canvas id="game-canvas" width="800" height="600"></canvas>
  </div>
</template>

<script>
import GameController from "@/lib/game/game_controller";

export default {
  name: "game",
  data() {
    return {
    }
  },
  created: function() {
    this.gameController = new GameController()
  },
  mounted: function() {
    this.gameController.init()
  }
};
</script>
