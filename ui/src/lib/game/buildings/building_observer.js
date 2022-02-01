import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";
//import ColorUtils from "@/lib/utils/color";

const ANIMATED_BUILDINGS = ["bridge", "castle", "puddle", "tree"];

class BuildingObserver {
  constructor(state) {
    this.scene = null;
    this.state = state;
    this.mesh = null;
    this.currentAnimation = null;
    this.container = null;
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
  }

  create() {
    let coords = this.state.coords;
    let mesh = null;
    if (ANIMATED_BUILDINGS.includes(this.state.type)) {
      this.container = Atlas.get(
        this.state.type + "AnimatedBuilding"
      ).instantiateModelsToScene();
      setTimeout(() => {
        this.playAnimation("Idle");
      }, Math.floor(Math.random() * Math.floor(2000)));
      mesh = this.container.rootNodes[0];
      this.meshRotation = 0;
    } else {
      mesh = Atlas.get(this.state.type + "Building").clone();
    }

    if (this.state.rotation !== undefined) {
      let axis = new BABYLON.Vector3(0, 1, 0);
      let quaternion = new BABYLON.Quaternion.RotationAxis(
        axis,
        Math.PI + (this.state.rotation * Math.PI) / 2
      );
      mesh.rotationQuaternion = quaternion;
    }
    mesh.enablePointerMoveEvents = true;

    mesh.position.x = this.getHorizontalMeshCoordinate(coords.x);
    mesh.position.y = this.getVerticalMeshCoordinate(coords.y);
    mesh.position.z = this.getHorizontalMeshCoordinate(coords.z);

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.isRecursive = true;
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          EventBus.$emit("pointer-over-building", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        EventBus.$emit("click-building", this);
      })
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          EventBus.$emit("pointer-out-building", this);
        }
      )
    );

    mesh.setEnabled(true);
    mesh.metadata = this.state;
    this.mesh = mesh;
  }

  getHorizontalMeshCoordinate(coordinate) {
    return coordinate * boardConfig.cellSize + boardConfig.cellSize / 2;
  }

  getVerticalMeshCoordinate(coordinate) {
    return coordinate * boardConfig.cellSize + boardConfig.cellSize;
  }

  playAnimation(name, loop = true) {
    if (this.container) {
      this.container.animationGroups.forEach(ag => {
        if (ag.name === name) {
          ag.start(loop);
          this.currentAnimation = name;
        } else {
          ag.reset();
          ag.stop();
        }
      });
    }
  }
}

export default BuildingObserver;
