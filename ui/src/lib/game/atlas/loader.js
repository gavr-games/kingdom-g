import * as BABYLON from "babylonjs";
import Atlas from "./atlas";

class Loader {
  constructor(scene, finishCallback) {
    this.scene = scene;
    this.finishCallback = finishCallback;
    this.assetsManager = new BABYLON.AssetsManager(scene);
    this.assetsManager.onFinish = finishCallback;
  }

  load() {
    let task = this.assetsManager.addMeshTask(
      "solidFill",
      "solidFill",
      "/game_assets/fills/",
      "solid.obj"
    );
    task.onSuccess = function(task) {
      task.loadedMeshes[0].setEnabled(false);
      Atlas.set("solidFill", task.loadedMeshes[0]);
    };
    this.assetsManager.load();
  }
}

export default Loader;
