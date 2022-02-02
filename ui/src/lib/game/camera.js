import * as BABYLON from "babylonjs";
import boardConfig from "./board/config";
import { EventBus } from "@/lib/event_bus";

class Camera {
  constructor(scene, canvas) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = null;
    EventBus.$on("my-castle-found", castleState => {
      this.rotateCameraToCastle(castleState);
    });
  }

  create() {
    this.camera = new BABYLON.ArcRotateCamera(
      "MainCamera",
      Math.PI / 2,
      Math.PI / 4,
      80,
      new BABYLON.Vector3(
        boardConfig.cellSize * 10,
        -5,
        boardConfig.cellSize * 10
      ),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
  }

  rotateCameraToCastle(castleState) {
    const x = castleState.coords.x;
    const z = castleState.coords.z;
    if (x == 0 && z == 0) {
      this.camera.alpha = 3.9;
    } else if (x == 19 && z == 19) {
      this.camera.alpha = 0.78;
    } else if (x == 19 && z == 0) {
      this.camera.alpha = -0.8;
    } else if (x == 0 && z == 19) {
      this.camera.alpha = 2.36;
    }
  }
}

export default Camera;
