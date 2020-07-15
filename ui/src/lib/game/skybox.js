import * as BABYLON from "babylonjs";
import { SkyMaterial } from "babylonjs-materials";

class Skybox {
  constructor(scene) {
    this.scene = scene;
    this.skybox = null;
  }

  create() {
    let skyboxMaterial = new SkyMaterial("skyMaterial", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.cameraOffset.y = 200;
    this.skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this.scene);
    this.skybox.position = new BABYLON.Vector3(0, 0, 0);
    this.skybox.material = skyboxMaterial;
    this.setSkyConfig("material.inclination", skyboxMaterial.inclination, 0);
  }

  setSkyConfig(property, from, to) {
    let keys = [
      { frame: 0, value: from },
      { frame: 100, value: to }
    ];

    let animation = new BABYLON.Animation(
      "animation",
      property,
      100,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animation.setKeys(keys);

    this.scene.stopAnimation(this.skybox);
    this.scene.beginDirectAnimation(this.skybox, [animation], 0, 100, false, 1);
  }
}

export default Skybox;
