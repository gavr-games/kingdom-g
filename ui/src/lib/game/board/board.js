import * as BABYLON from "babylonjs";

class Board {
  constructor(scene) {
    this.scene = scene;
    this.ground = null;
  }

  create() {
    BABYLON.SceneLoader.LoadAssetContainer(
      "/game_assets/fills/",
      "water.obj",
      this.scene,
      function(container) {
        console.log(container);
        container.meshes.forEach((mesh) => {
          mesh.position.x = 2.5;
          mesh.position.y = -2;
          mesh.position.z = 2.5;
        });
        container.addAllToScene();
      }
    );
    BABYLON.SceneLoader.LoadAssetContainer(
      "/game_assets/fills/",
      "solid.obj",
      this.scene,
      function(container) {
        container.meshes.forEach((mesh) => {
          mesh.position.x = 0;
          mesh.position.y = -2;
          mesh.position.z = 2.5;
        });
        container.addAllToScene();
      }
    );
  }
}

export default Board;
