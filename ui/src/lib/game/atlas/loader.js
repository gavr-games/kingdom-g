import * as BABYLON from "babylonjs";
import boardConfig from "../board/config";

class Loader {
  constructor(scene, finishCallback, atlas) {
    this.atlas = atlas;
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
    task.onSuccess = task => {
      task.loadedMeshes[0].setEnabled(false);
      this.atlas.set("solidFill", task.loadedMeshes[0]);
    };
    this.loadUnits();
    this.loadBuildings();
    this.assetsManager.load();
  }

  loadBuildings() {
    let buildings = [
      "barracks",
      "bridge",
      "castle",
      "coin_factory",
      "healing_temple",
      "magic_tower",
      "mountains",
      "scarecrow",
      "teleport",
      "wall_closed",
      "wall_opened"
    ];
    buildings.forEach(building => {
      let task = this.assetsManager.addMeshTask(
        building,
        building,
        "/game_assets/buildings/",
        building + ".obj"
      );
      task.onSuccess = task => {
        let mesh = task.loadedMeshes[0];
        let pivotDiff = boardConfig.cellSize;
        mesh.setPivotPoint(
          new BABYLON.Vector3(pivotDiff + pivotDiff / 2, 0, -pivotDiff / 2)
        );
        mesh.setEnabled(false);
        this.atlas.set(building + "Building", mesh);
      };
    });
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
      task.onSuccess = task => {
        task.loadedMeshes[0].setEnabled(false);
        let mesh = task.loadedMeshes[0];
        this.atlas.set(unit + "Unit", mesh);
      };
    });
  }
}

export default Loader;
