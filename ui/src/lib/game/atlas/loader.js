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
    this.loadUnits()
    this.assetsManager.load();
  }

  loadUnits() {
    let units = [
      "arbalester",
      "archer",
      "dragon",
      "knight_with_horse",
      "knight",
      "ninja",
      "spearman",
      "swordsman",
      "wizard"
    ];
    units.forEach(unit => {
      let task = this.assetsManager.addMeshTask(
        unit,
        unit,
        "/game_assets/units/",
        unit + ".obj"
      );
      task.onSuccess = function(task) {
        task.loadedMeshes[0].setEnabled(false);
        Atlas.set(unit + "Unit", task.loadedMeshes[0]);
      };
    });
  }
}

export default Loader;
