import * as BABYLON from "babylonjs";
import * as Loaders from "babylonjs-loaders";
import { EventBus } from "@/lib/event_bus";
import Camera from "./camera";
import Light from "./light";
import Board from "./board/board";
import Grid from "./grid";
import Loader from "./atlas/loader";

class Game {
  constructor() {
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.loader = null;
    this.camera = null;
    this.light = null;
    this.board = null;
    EventBus.$on("init-game", gamePayload => {
      this.init(gamePayload);
    });
  }

  createScene(gamePayload) {
    let scene = new BABYLON.Scene(this.engine);
    //scene.actionManager = new BABYLON.ActionManager(scene);
    //scene.clearColor = new BABYLON.Color3(0, 0, 0);

    //this.registerActions(scene)
    this.loader = new Loader(scene, () => {
      this.createObjects(gamePayload);
    });
    this.loader.load();

    return scene;
  }

  createObjects(gamePayload) {
    this.camera = new Camera(this.scene, this.canvas);
    this.camera.create();

    this.board = new Board(this.scene, gamePayload);
    this.board.create();

    this.light = new Light(this.scene);
    this.light.create();

    if (process.env.NODE_ENV === "development") {
      let grid = new Grid(this.scene);
      grid.create();
    }

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  init(gamePayload) {
    console.log(gamePayload);
    this.canvas = document.getElementById("game-canvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    Loaders.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    this.scene = this.createScene(gamePayload);
  }
}

export default Game;
