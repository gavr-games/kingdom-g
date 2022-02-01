import * as BABYLON from "babylonjs";

/**
 * Creates a new ContainerAssetTask
 * @param name defines the name of the task
 * @param meshesNames defines the list of mesh's names you want to load
 * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
 * @param sceneFilename defines the filename of the scene to load from
 */
class ContainerAssetTask extends BABYLON.AbstractAssetTask {
  constructor(
    /**
     * Defines the name of the task
     */
    name,
    /**
     * Defines the list of mesh's names you want to load
     */
    meshesNames,
    /**
     * Defines the root url to use as a base to load your meshes and associated resources
     */
    rootUrl,
    /**
     * Defines the filename of the scene to load from
     */
    sceneFilename
  ) {
    super(name);
    this.name = name;
    this.meshesNames = meshesNames;
    this.rootUrl = rootUrl;
    this.sceneFilename = sceneFilename;
  }
  /**
   * Execute the current task
   * @param scene defines the scene where you want your assets to be loaded
   * @param onSuccess is a callback called when the task is successfully executed
   * @param onError is a callback called if an error occurs
   */
  runTask(scene, onSuccess, onError) {
    var _this = this;
    BABYLON.SceneLoader.LoadAssetContainer(
      this.rootUrl,
      this.sceneFilename,
      scene,
      function(container) {
        _this.loadedContainer = container;
        _this.loadedMeshes = container.meshes;
        _this.loadedParticleSystems = container.particleSystems;
        _this.loadedSkeletons = container.skeletons;
        _this.loadedAnimationGroups = container.animationGroups;
        onSuccess();
      },
      null,
      function(scene, message, exception) {
        onError(message, exception);
      }
    );
  }
}
BABYLON.AssetsManager.prototype.addContainerTask = function(
  taskName,
  meshesNames,
  rootUrl,
  sceneFilename
) {
  var task = new ContainerAssetTask(
    taskName,
    meshesNames,
    rootUrl,
    sceneFilename
  );
  this._tasks.push(task);
  return task;
};

class Loader {
  constructor(scene, finishCallback, atlas) {
    this.atlas = atlas;
    this.scene = scene;
    this.finishCallback = finishCallback;
    this.assetsManager = new BABYLON.AssetsManager(scene);
    this.assetsManager.addContainerTask = function(
      taskName,
      meshesNames,
      rootUrl,
      sceneFilename
    ) {
      var task = new ContainerAssetTask(
        taskName,
        meshesNames,
        rootUrl,
        sceneFilename
      );
      this._tasks.push(task);
      return task;
    };
    this.assetsManager.onFinish = finishCallback;
  }

  load() {
    this.loadFills();
    this.loadUnits();
    this.loadBuildings();
    this.assetsManager.load();
  }

  loadFills() {
    let fills = ["solid"];
    fills.forEach(fill => {
      let task = this.assetsManager.addMeshTask(
        fill,
        fill,
        "/game_assets/fills/",
        fill + ".obj"
      );
      task.onSuccess = task => {
        let mesh = task.loadedMeshes[0];
        mesh.setEnabled(false);
        this.atlas.set(fill + "Fill", mesh);
      };
    });
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
      "puddle",
      "scarecrow",
      "teleport",
      "tree",
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
        mesh.setEnabled(false);
        this.atlas.set(building + "Building", mesh);
      };
    });
    let buildingsGltf = ["bridge", "castle", "puddle", "tree"];
    buildingsGltf.forEach(building => {
      let task = this.assetsManager.addContainerTask(
        building,
        "",
        "/game_assets/buildings/",
        building + ".gltf"
      );
      task.onSuccess = task => {
        task.loadedContainer.meshes[0].scaling = new BABYLON.Vector3(
          0.1,
          0.1,
          0.1
        );
        this.atlas.set(building + "AnimatedBuilding", task.loadedContainer);
      };
    });
  }

  loadUnits() {
    let unitsObj = [
      "archer",
      "catapult",
      "chevalier",
      "dragon",
      "knight",
      "marksman",
      "ninja",
      "ram",
      "spearman",
      "swordsman",
      "wizard"
    ];
    unitsObj.forEach(unit => {
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
    let unitsGltf = ["archer", "dragon", "spearman"];
    unitsGltf.forEach(unit => {
      let task = this.assetsManager.addContainerTask(
        unit,
        "",
        "/game_assets/units/",
        unit + ".gltf"
      );
      task.onSuccess = task => {
        task.loadedContainer.meshes[0].scaling = new BABYLON.Vector3(
          0.1,
          0.1,
          0.1
        );
        this.atlas.set(unit + "AnimatedUnit", task.loadedContainer);
      };
    });
  }
}

export default Loader;
