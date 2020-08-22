import * as BABYLON from "babylonjs";
import * as Loaders from "babylonjs-loaders";
import { EventBus } from "@/lib/event_bus";
import Camera from "@/lib/game/camera";
import Light from "@/lib/game/light";
import Skybox from "@/lib/game/skybox";
import Grid from "@/lib/game/grid";
import Loader from "@/lib/game/atlas/loader";
import Atlas from "@/lib/game/atlas/atlas";

class GameObserver {
  constructor() {
    this.selectHighlight = null;
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.loader = null;
    this.camera = null;
    this.light = null;
    this.skybox = null;
    this.renderObservers = [];
    this.showGrid = false;
    this.fpsEl = null;
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

    this.loader = new Loader(
      this.scene,
      () => {
        this.createObjects();
        this.runRenderLoop();
        EventBus.$emit("scene-created", this.scene);
      },
      Atlas
    );
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
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      this.engine.resize();
    });
  }

  createObjects() {
    this.camera = new Camera(this.scene, this.canvas);
    this.camera.create();

    this.light = new Light(this.scene);
    this.light.create();

    this.skybox = new Skybox(this.scene);
    this.skybox.create();

    if (this.showGrid) {
      let grid = new Grid(this.scene);
      grid.create();
    }
  }

  runRenderLoop() {
    this.engine.runRenderLoop(() => {
      if (this.scene.activeCamera) {
        this.scene.render();
      }
      this.renderObservers.forEach(observer => {
        observer.obj.update();
      });
      if (this.fpsEl) {
        this.fpsEl.innerHTML = this.engine.getFps().toFixed() + " fps";
      } else {
        this.fpsEl = document.getElementById("fps");
      }
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

  highlight(mesh, color = "select") {
    color = this.getHiglightColor(color);
    this.selectHighlight.addMesh(mesh, color);
  }

  unhighlight(mesh, color = "select") {
    color = this.getHiglightColor(color);
    this.selectHighlight.removeMesh(mesh, color);
  }

  getHiglightColor(color) {
    switch (color) {
      case "select":
        return BABYLON.Color3.Green();
      case "target":
        return BABYLON.Color3.Red();
    }
    return BABYLON.Color3.Green();
  }
}

const gameObserver = new GameObserver();

export default gameObserver;
