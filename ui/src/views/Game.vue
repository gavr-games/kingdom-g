<template>
  <div id="game-cont">
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <a href="#" @click="enterFullscreen">Fullscreen</a>
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
  mounted: function() {
    GameController.init()
  },
  methods: {
    enterFullscreen() {
      GameController.enterFullscreen()
    }
  }
};
</script>
