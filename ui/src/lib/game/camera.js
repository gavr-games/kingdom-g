import * as BABYLON from "babylonjs";

class Camera {
  constructor(scene) {
    this.scene = scene;
    this.camera = null;
  }

  create() {
    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 4,
      30,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
  }
}

export default Camera;
