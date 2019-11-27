import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

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
        // eslint-disable-next-line no-unused-vars
        container.meshes.forEach((mesh, index) => {
          mesh.position.x += 3;
        });
        container.addAllToScene();
      }
    );
    BABYLON.SceneLoader.LoadAssetContainer(
      "/game_assets/fills/",
      "solid.obj",
      this.scene,
      function(container) {
        console.log(container);
        container.addAllToScene();
      }
    );
  }
}

export default Board;
