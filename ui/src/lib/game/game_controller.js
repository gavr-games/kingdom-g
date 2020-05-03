import { EventBus } from "@/lib/event_bus";
import Game from "./game";
import boardConfig from "./board/config";

class GameController {
  constructor() {
    this.game = new Game();
  }

  init() {
    EventBus.$emit("init-game");
  }

  enterFullscreen() {
    this.game.engine.enterFullscreen();
  }

  moveUnit(unit, cell) {
    let coords = {
      x: cell.mesh.position.x + boardConfig.cellSize / 2,
      z: cell.mesh.position.z - boardConfig.cellSize / 2,
      y: 0
    };
    unit.moveToCoords(coords);
    EventBus.$emit("unit-moved", unit, cell);
  }
}
const gameController = new GameController();

export default gameController;
