import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "@/lib/game/board/config";
import Atlas from "@/lib/game/atlas/atlas";
import { MOVING } from "@/lib/game/units/unit_state";
import GameObserver from "@/lib/game/game_observer";
import ColorUtils from "@/lib/utils/color";

const SPEED = 0.1;
const ANIMATED_UNITS = ["archer", "catapult", "dragon", "ram", "spearman"];
const POSITION_CORRECTION = {
  dragon: 1
};

class UnitObserver {
  constructor(state) {
    this.state = state;
    this.scene = null;
    this.mesh = null;
    this.meshRotation = Math.PI;
    this.currentAnimation = null;
    this.playerTorus = null;
    this.container = null;
    this.sceneCreatedCallback = scene => {
      this.scene = scene;
      this.create();
    };
    this.checkLevelupCallback = unitObserver => {
      if (unitObserver.state.id === this.state.id) {
        this.checkCanLevelUp();
      }
    };
    EventBus.$on("scene-created", this.sceneCreatedCallback);
    EventBus.$on("unit-deselected", this.checkLevelupCallback);
    GameObserver.addRenderObserver(`unit-${this.state.id}`, this);
  }

  create() {
    const coords = this.state.coords;
    let mesh = null;

    if (ANIMATED_UNITS.includes(this.state.type)) {
      this.container = Atlas.get(
        this.state.type + "AnimatedUnit"
      ).instantiateModelsToScene();
      setTimeout(() => {
        this.playAnimation("Idle");
      }, Math.floor(Math.random() * Math.floor(2000)));
      mesh = this.container.rootNodes[0];
      this.meshRotation = 0;
    } else {
      mesh = Atlas.get(this.state.type + "Unit").clone();
    }
    mesh.enablePointerMoveEvents = true;
    mesh.position.x = this.getHorizontalMeshCoordinate(coords.x);
    mesh.position.y = this.getVerticalMeshCoordinate(coords.y);
    mesh.position.z = this.getHorizontalMeshCoordinate(coords.z);
    mesh.metadata = this.state;

    this.createPlayerTorus();

    // Set initial rotation
    if (this.state.previousPosition !== null) {
      let previousCoords = {
        x: this.getHorizontalMeshCoordinate(this.state.previousPosition[0]),
        z: this.getHorizontalMeshCoordinate(this.state.previousPosition[1]),
        y: this.getVerticalMeshCoordinate(0)
      };

      let rotationAngle = Math.atan2(
        mesh.position.z - previousCoords.z,
        mesh.position.x - previousCoords.x
      );
      let rotationDelta = this.meshRotation - rotationAngle;
      if (rotationDelta != 0) {
        this.meshRotation = rotationAngle;
        mesh.rotate(BABYLON.Axis.Y, rotationDelta);
      }
    }

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.isRecursive = true;
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          EventBus.$emit("pointer-over-unit", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        EventBus.$emit("click-unit", this);
      })
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          EventBus.$emit("pointer-out-unit", this);
        }
      )
    );
    mesh.setEnabled(true);
    this.mesh = mesh;
    this.checkCanLevelUp();
  }

  createPlayerTorus() {
    const coords = this.state.coords;
    this.playerTorus = BABYLON.Mesh.CreateTorus(
      "torus",
      boardConfig.cellSize * this.state.size,
      0.1,
      100,
      this.scene
    );
    this.playerTorus.position.x = this.getHorizontalMeshCoordinate(coords.x);
    this.playerTorus.position.y = this.getVerticalMeshCoordinate(coords.y);
    this.playerTorus.position.z = this.getHorizontalMeshCoordinate(coords.z);
    const torusMaterial = new BABYLON.StandardMaterial(
      "playerTorusMaterial",
      this.scene
    );
    torusMaterial.diffuseColor = ColorUtils.getColorFromMap(this.state.player);
    torusMaterial.emissiveColor = ColorUtils.getColorFromMap(this.state.player);
    this.playerTorus.material = torusMaterial;
  }

  update() {
    if (this.state.state == MOVING) {
      if (this.currentAnimation !== "Move") {
        this.playAnimation("Move");
      }
      let speedX = SPEED;
      let speedY = SPEED;
      let speedZ = SPEED;
      let targetCoords = {
        x: this.getHorizontalMeshCoordinate(this.state.targetPosition[0]),
        z: this.getHorizontalMeshCoordinate(this.state.targetPosition[1]),
        y: this.getVerticalMeshCoordinate(0)
      };

      let rotationAngle = Math.atan2(
        targetCoords.z - this.mesh.position.z,
        targetCoords.x - this.mesh.position.x
      );
      let rotationDelta = this.meshRotation - rotationAngle;
      if (rotationDelta != 0) {
        this.meshRotation = rotationAngle;
        this.mesh.rotate(BABYLON.Axis.Y, rotationDelta);
      }

      if (targetCoords.x < this.mesh.position.x) {
        speedX = -SPEED;
      }
      if (targetCoords.y < this.mesh.position.y) {
        speedY = -SPEED;
      }
      if (targetCoords.z < this.mesh.position.z) {
        speedZ = -SPEED;
      }
      let newX = this.mesh.position.x + speedX;
      let newY = this.mesh.position.y + speedY;
      let newZ = this.mesh.position.z + speedZ;
      if (
        (newX > targetCoords.x && speedX > 0) ||
        (newX < targetCoords.x && speedX < 0)
      ) {
        newX = targetCoords.x;
      }
      if (
        (newY > targetCoords.y && speedY > 0) ||
        (newY < targetCoords.y && speedY < 0)
      ) {
        newY = targetCoords.y;
      }
      if (
        (newZ > targetCoords.z && speedZ > 0) ||
        (newZ < targetCoords.z && speedZ < 0)
      ) {
        newZ = targetCoords.z;
      }
      this.mesh.position.x = newX;
      this.mesh.position.y = newY;
      this.mesh.position.z = newZ;
      this.playerTorus.position.x = newX;
      this.playerTorus.position.y = newY;
      this.playerTorus.position.z = newZ;
      if (
        newX == targetCoords.x &&
        newY == targetCoords.y &&
        newZ == targetCoords.z
      ) {
        EventBus.$emit("move-unit-animation-finished", this);
        this.playAnimation("Idle");
        this.state.stop();
      }
    }
  }

  remove() {
    EventBus.$emit("pointer-out-unit", this);
    GameObserver.removeRenderObserver(`unit-${this.state.id}`);
    EventBus.$off("scene-created", this.sceneCreatedCallback);
    EventBus.$off("unit-deselected", this.checkLevelupCallback);
    GameObserver.unhighlight(this.mesh, "levelup");
    this.mesh.dispose();
    this.playerTorus.dispose();
    this.mesh = null;
    this.playerTorus = null;
    this.state = null;
  }

  attack() {
    this.playAnimation("Attack", false);
  }

  checkCanLevelUp() {
    if (this.state.canLevelUp) {
      GameObserver.highlight(this.mesh, "levelup");
    } else {
      GameObserver.unhighlight(this.mesh, "levelup");
    }
  }

  getHorizontalMeshCoordinate(coordinate) {
    let positionCorrection = 0;
    if (POSITION_CORRECTION.hasOwnProperty(this.state.type)) {
      positionCorrection = POSITION_CORRECTION[this.state.type];
    }
    return (
      coordinate * boardConfig.cellSize +
      boardConfig.cellSize / 2 -
      ((this.state.size - 1) * boardConfig.cellSize) / 2 +
      positionCorrection * boardConfig.cellSize
    );
  }

  getVerticalMeshCoordinate(coordinate) {
    let meshCoordinate = coordinate * boardConfig.cellSize;
    if (ANIMATED_UNITS.includes(this.state.type)) {
      meshCoordinate += boardConfig.cellSize;
    }
    return meshCoordinate;
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

export default UnitObserver;
