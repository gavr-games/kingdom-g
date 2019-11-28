import * as BABYLON from "babylonjs";

class Light {
  constructor(scene) {
    this.scene = scene;
    this.light = null;
  }

  create() {
    this.light = new BABYLON.HemisphericLight(
      "HemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
  }
}

export default Light;
