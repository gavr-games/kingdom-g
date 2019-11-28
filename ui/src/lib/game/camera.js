import * as BABYLON from "babylonjs";

class Camera {
  constructor(scene, canvas) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = null;
  }

  create() {
    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI + Math.PI / 4,
      Math.PI / 4,
      40,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
  }
}

export default Camera;
