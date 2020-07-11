import * as BABYLON from "babylonjs";
import * as Loaders from "babylonjs-loaders";
import { EventBus } from "@/lib/event_bus";
import Camera from "./camera";
import Light from "./light";
import Grid from "./grid";
import Loader from "./atlas/loader";

class GameObserver {
  constructor() {
    this.selectHighlight = null;
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.loader = null;
    this.camera = null;
    this.light = null;
    this.renderObservers = [];
  }

  init() {
    this.canvas = document.getElementById("game-canvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    Loaders.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    this.createScene();
    this.selectHighlight = new BABYLON.HighlightLayer(
      "selectHighlight",
      this.scene
    );
  }

  createScene() {
    this.scene = new BABYLON.Scene(this.engine);

    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.registerActions(this.scene);

    this.loader = new Loader(this.scene, () => {
      this.createObjects();
      this.runRenderLoop();
      EventBus.$emit("scene-created", this.scene);
    });
    this.loader.load();
  }

  registerActions(scene) {
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        evt => {
          EventBus.$emit("keydown", evt.sourceEvent.key);
        }
      )
    );
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        evt => {
          EventBus.$emit("keyup", evt.sourceEvent.key);
        }
      )
    );

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  createObjects() {
    this.camera = new Camera(this.scene, this.canvas);
    this.camera.create();

    this.light = new Light(this.scene);
    this.light.create();

    if (process.env.NODE_ENV === "development") {
      let grid = new Grid(this.scene);
      grid.create();
    }
  }

  runRenderLoop() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
      this.renderObservers.forEach(observer => {
        observer.obj.update();
      });
    });
  }

  addRenderObserver(id, observer) {
    this.renderObservers.push({
      id: id,
      obj: observer
    });
  }

  removeRenderObserver(id) {
    this.renderObservers = this.renderObservers.filter(ob => ob.id !== id);
  }

  highlight(mesh) {
    this.selectHighlight.addMesh(mesh, BABYLON.Color3.Green());
  }

  unhighlight(mesh) {
    this.selectHighlight.removeMesh(mesh, BABYLON.Color3.Green());
  }
}

const gameObserver = new GameObserver();

export default gameObserver;
