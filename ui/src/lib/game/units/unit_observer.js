import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "@/lib/game/board/config";
import Atlas from "@/lib/game/atlas/atlas";
import { MOVING } from "@/lib/game/units/unit_state";
import GameObserver from "@/lib/game/game_observer";

const SPEED = 0.2;

class UnitObserver {
  constructor(state) {
    this.state = state;
    this.scene = null;
    this.mesh = null;
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
    GameObserver.addRenderObserver(`unit-${this.state.id}`, this);
  }

  create() {
    let coords = this.state.coords;
    let mesh = Atlas.get(this.state.type + "Unit").clone();
    mesh.position.x =
      coords.x * boardConfig.cellSize + boardConfig.cellSize / 2;
    mesh.position.y = coords.y * boardConfig.cellSize;
    mesh.position.z =
      boardConfig.cellSize / 2 + coords.z * boardConfig.cellSize;
    mesh.visibility = 1;
    mesh.metadata = this.state;

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          EventBus.$emit("pointer-over-unit", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        EventBus.$emit("click-unit", this);
      })
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          EventBus.$emit("pointer-out-unit", this);
        }
      )
    );
    mesh.setEnabled(true);
    this.mesh = mesh;
  }

  update() {
    if (this.state.state == MOVING) {
      let speedX = SPEED;
      let speedY = SPEED;
      let speedZ = SPEED;
      let targetCoords = {
        x:
          this.state.targetPosition[0] * boardConfig.cellSize +
          boardConfig.cellSize / 2,
        z:
          this.state.targetPosition[1] * boardConfig.cellSize +
          boardConfig.cellSize / 2,
        y: 0
      };
      if (targetCoords.x < this.mesh.position.x) {
        speedX = -SPEED;
      }
      if (targetCoords.y < this.mesh.position.y) {
        speedY = -SPEED;
      }
      if (targetCoords.z < this.mesh.position.z) {
        speedZ = -SPEED;
      }
      let newX = this.mesh.position.x + speedX;
      let newY = this.mesh.position.y + speedY;
      let newZ = this.mesh.position.z + speedZ;
      if (
        (newX > targetCoords.x && speedX > 0) ||
        (newX < targetCoords.x && speedX < 0)
      ) {
        newX = targetCoords.x;
      }
      if (
        (newY > targetCoords.y && speedY > 0) ||
        (newY < targetCoords.y && speedY < 0)
      ) {
        newY = targetCoords.y;
      }
      if (
        (newZ > targetCoords.z && speedZ > 0) ||
        (newZ < targetCoords.z && speedZ < 0)
      ) {
        newZ = targetCoords.z;
      }
      this.mesh.position.x = newX;
      this.mesh.position.y = newY;
      this.mesh.position.z = newZ;
      if (
        newX == targetCoords.x &&
        newY == targetCoords.y &&
        newZ == targetCoords.z
      ) {
        EventBus.$emit("move-unit-animation-finished", this);
        this.state.stop();
      }
    }
  }
}

export default UnitObserver;
