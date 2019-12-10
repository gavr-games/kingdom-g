import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import Coords from "../../utils/coords";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";
import GameState from "../game_state";

class Cell {
  constructor(scene, coordsKey, payload) {
    this.scene = scene;
    this.coords = Coords.parse(coordsKey);
    this.payload = payload;
    this.selected = false;
    this.mesh = null;
  }

  create() {
    let mesh = Atlas.get("solidFill").clone();
    let coords = this.coords;
    mesh.visibility = 1;
    mesh.name = "cell" + this.coordsKey;
    mesh.position.x = coords.x * boardConfig.cellSize;
    mesh.position.y = -2 + coords.y * boardConfig.cellSize;
    mesh.position.z = boardConfig.cellSize + coords.z * boardConfig.cellSize;
    mesh.metadata = {
      type: "cell",
      fill: "solid",
      originalCoords: this.coordsKey
    };
    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          if (GameState.canSelectCell()) {
            this.selected = true;
            EventBus.$emit("pointer-over-cell", this);
          }
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          this.selected = false;
          EventBus.$emit("pointer-out-cell", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        evt => {
          console.log(evt);
        }
      )
    );
    this.mesh = mesh;
  }
}

export default Cell;
