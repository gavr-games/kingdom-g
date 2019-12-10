import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import Coords from "../../utils/coords";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";
import GameState from "../game_state";

class Unit {
  constructor(scene, payload) {
    this.scene = scene;
    this.payload = payload;
    this.selected = false;
    this.mesh = null;
    EventBus.$on("unit-moved", unit => {
      if (unit === this) {
        this.selected = false;
      }
    });
  }

  create() {
    let coords = Coords.parsePosition(this.payload.position);
    let mesh = Atlas.get(this.payload.type + "Unit").clone();
    mesh.position.x =
      coords.x * boardConfig.cellSize + boardConfig.cellSize / 2;
    mesh.position.y = coords.y * boardConfig.cellSize;
    mesh.position.z =
      boardConfig.cellSize / 2 + coords.z * boardConfig.cellSize;
    mesh.visibility = 1;
    mesh.metadata = this.payload;

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        console.log(this.selected);
        if (this.selected) {
          this.selected = false;
          EventBus.$emit("deselected-unit", this);
          return;
        }
        if (!GameState.canMove()) {
          return;
        }
        //TODO: check unit can move
        this.selected = true;
        EventBus.$emit("selected-unit", this);
      })
    );
    this.mesh = mesh;
  }
}

export default Unit;
