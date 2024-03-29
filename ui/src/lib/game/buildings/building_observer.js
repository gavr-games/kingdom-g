import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";
import GameState from "@/lib/game/game_state";
import ColorUtils from "@/lib/utils/color";

class BuildingObserver {
  constructor(state) {
    this.scene = null;
    this.state = state;
    this.mesh = null;
    this.currentAnimation = null;
    this.container = null;
    this.playerToruses = [];
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
  }

  create() {
    let coords = this.state.coords;
    let mesh = null;
    this.container = Atlas.get(
      this.state.type + "AnimatedBuilding"
    ).instantiateModelsToScene();
    setTimeout(() => {
      this.playAnimation("Idle");
    }, Math.floor(Math.random() * Math.floor(2000)));
    mesh = this.container.rootNodes[0];
    this.meshRotation = 0;

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

    if (this.state.player !== undefined) {
      this.createPlayerToruses();
    }

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

    // This will allow to correctly position camera according to players castle
    if (
      this.state.type === "castle" &&
      this.state.player === GameState.getMyPlayerId()
    ) {
      EventBus.$emit("my-castle-found", this.state);
    }

    mesh.setEnabled(true);
    mesh.metadata = this.state;
    mesh.freezeWorldMatrix();
    mesh.cullingStrategy =
      BABYLON.AbstractMesh.CULLINGSTRATEGY_OPTIMISTIC_INCLUSION_THEN_BSPHERE_ONLY;
    this.mesh = mesh;
  }

  createPlayerToruses() {
    this.state.allCoords.forEach(coords => {
      let playerTorus = BABYLON.Mesh.CreateTorus(
        "torus",
        boardConfig.cellSize + boardConfig.cellSize / 3,
        0.1,
        4,
        this.scene
      );
      playerTorus.position.x = this.getHorizontalMeshCoordinate(coords.x);
      playerTorus.position.y = this.getVerticalMeshCoordinate(coords.y);
      playerTorus.position.z = this.getHorizontalMeshCoordinate(coords.z);
      const torusMaterial = new BABYLON.StandardMaterial(
        "playerTorusMaterial",
        this.scene
      );
      torusMaterial.diffuseColor = ColorUtils.getColorFromMap(
        this.state.player
      );
      torusMaterial.emissiveColor = ColorUtils.getColorFromMap(
        this.state.player
      );
      torusMaterial.freeze();
      playerTorus.material = torusMaterial;
      const axis = new BABYLON.Vector3(0, 1, 0);
      const quaternion = new BABYLON.Quaternion.RotationAxis(axis, Math.PI / 4);
      playerTorus.rotationQuaternion = quaternion;
      this.playerToruses.push(playerTorus);
    });
  }

  getHorizontalMeshCoordinate(coordinate) {
    return coordinate * boardConfig.cellSize + boardConfig.cellSize / 2;
  }

  getVerticalMeshCoordinate(coordinate) {
    return coordinate * boardConfig.cellSize + boardConfig.cellSize;
  }

  remove() {
    this.playAnimation("Die", false, () => {
      EventBus.$emit("pointer-out-building", this);
      EventBus.$off("scene-created", this.sceneCreatedCallback);
      this.mesh.dispose();
      this.playerToruses.forEach(torus => {
        torus.dispose();
      });
      this.playerToruses = null;
      this.mesh = null;
      this.state = null;
      this.container = null;
      EventBus.$emit("animation-finished");
    });
  }

  playAnimation(name, loop = true, endCallback = false) {
    if (this.container) {
      this.container.animationGroups.forEach(ag => {
        if (ag.name === name) {
          if (endCallback) {
            ag.onAnimationGroupEndObservable.addOnce(() => {
              endCallback();
            });
          }
          ag.start(loop);
          this.currentAnimation = name;
        } else {
          ag.reset();
          ag.stop();
        }
      });
      // If animation for this building does not exist
      if (this.currentAnimation != name && endCallback) {
        endCallback();
      }
    }
  }
}

export default BuildingObserver;
