import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import Loader from "@/lib/game/atlas/loader";
import ObjectPopupAtlas from "@/lib/game/atlas/object_popup_atlas";

const ROTATION_SPEED = Math.PI / 84;
const CAMERA_RADIUS = 6;

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
      CAMERA_RADIUS,
      new BABYLON.Vector3(0, 1.5, 0),
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
    this.mesh = ObjectPopupAtlas.get(
      object.type + "Animated" + this.capitalizeFirstLetter(object.objectClass)
    ).instantiateModelsToScene().rootNodes[0];
    this.mesh.setEnabled(true);

    if (object.objectClass == "unit") {
      this.camera.radius = CAMERA_RADIUS + object.size - 1;
    } else {
      this.camera.radius = CAMERA_RADIUS;
    }
  }

  hideObject() {
    if (this.mesh !== null) {
      this.scene.removeMesh(this.mesh);
      this.mesh.dispose();
      this.mesh = null;
    }
  }

  update() {
    if (this.mesh !== null) {
      this.mesh.rotate(BABYLON.Axis.Y, ROTATION_SPEED);
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

const playersPanelObserver = new ObjectPopupObserver();

export default playersPanelObserver;
