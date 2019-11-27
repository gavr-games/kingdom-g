import * as BABYLON from "babylonjs";

class Light {
  constructor(scene) {
    this.scene = scene;
    this.light = null;
  }

  create() {
    this.light = new BABYLON.PointLight(
      "pointLight",
      new BABYLON.Vector3(1, 10, 1),
      this.scene
    );
  }
}

export default Light;
