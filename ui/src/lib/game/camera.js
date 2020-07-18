import * as BABYLON from "babylonjs";
import boardConfig from "./board/config";

class Camera {
  constructor(scene, canvas) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = null;
  }

  create() {
    this.camera = new BABYLON.ArcRotateCamera(
      "MainCamera",
      Math.PI / 2,
      Math.PI / 4,
      60,
      new BABYLON.Vector3(
        boardConfig.cellSize * 10,
        -5,
        boardConfig.cellSize * 10
      ),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
  }
}

export default Camera;
