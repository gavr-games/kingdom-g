import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import Loader from "@/lib/game/atlas/loader";
import ObjectPopupAtlas from "@/lib/game/atlas/object_popup_atlas";

const ROTATION_SPEED = Math.PI / 84;

class ObjectPopupObserver {
  init() {
    this.camera = null;
    this.light = null;
    this.mesh = null;
    this.engine = null;
    this.canvas = document.getElementById("object-popup-canvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    this.create();
    EventBus.$on("pointer-over-unit", unitObserver => {
      this.showObject(unitObserver.state);
    });
    EventBus.$on("pointer-over-building", buildingObserver => {
      this.showObject(buildingObserver.state);
    });
    EventBus.$on("pointer-out-unit", () => {
      this.hideObject();
    });
    EventBus.$on("pointer-out-building", () => {
      this.hideObject();
    });
  }

  create() {
    this.camera = new BABYLON.ArcRotateCamera(
      "MainCamera",
      (Math.PI * 3) / 4,
      Math.PI / 2,
      5,
      new BABYLON.Vector3(0, 3.5, 0),
      this.scene
    );

    this.light = new BABYLON.HemisphericLight(
      "HemiLight",
      new BABYLON.Vector3(0, 10, 0),
      this.scene
    );
    this.light.intensity = 1.3;

    this.loader = new Loader(
      this.scene,
      () => {
        this.runRenderLoop();
      },
      ObjectPopupAtlas
    );
    this.loader.load();
  }

  runRenderLoop() {
    this.engine.runRenderLoop(() => {
      if (this.scene.activeCamera) {
        this.scene.render();
      }
      this.update();
    });
  }

  showObject(object) {
    switch (object.objectClass) {
      case "unit":
        this.mesh = ObjectPopupAtlas.get(object.type + "Unit").createInstance();
        this.mesh.setEnabled(true);
        break;
      case "building":
        this.mesh = ObjectPopupAtlas.get(object.type + "Building").createInstance();
        this.mesh.setEnabled(true);
        break;
    }
  }

  hideObject() {
    if (this.mesh !== null) {
      this.scene.removeMesh(this.mesh);
      this.mesh = null;
    }
  }

  update() {
    if (this.mesh !== null) {
      this.mesh.rotate(BABYLON.Axis.Y, ROTATION_SPEED);
    }
  }
}

const playersPanelObserver = new ObjectPopupObserver();

export default playersPanelObserver;
