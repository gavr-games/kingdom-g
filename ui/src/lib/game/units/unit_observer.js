import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "@/lib/game/board/config";
import Atlas from "@/lib/game/atlas/atlas";
import { MOVING } from "@/lib/game/units/unit_state";
import GameObserver from "@/lib/game/game_observer";
import ColorUtils from "@/lib/utils/color";
import ActionController from "@/lib/game/actions/actions_controller";

const SPEED = 0.1;
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
    this.shieldMesh = null;
    this.playerTorus = null;
    this.shootAreaMeshes = [];
    this.container = null;
    this.sceneCreatedCallback = scene => {
      this.scene = scene;
      this.create();
    };
    this.unitSelectedCallback = unitObserver => {
      if (unitObserver.state.id === this.state.id) {
        if (ActionController.currentActionName == "unit_shoot") {
          this.showShootingParams();
        }
      }
    };
    this.unitDeselectedCallback = unitObserver => {
      if (unitObserver.state.id === this.state.id) {
        this.hideShootingParams();
        this.checkCanLevelUp();
      }
    };
    EventBus.$on("scene-created", this.sceneCreatedCallback);
    EventBus.$on("unit-selected", this.unitSelectedCallback);
    EventBus.$on("unit-deselected", this.unitDeselectedCallback);
    GameObserver.addRenderObserver(`unit-${this.state.id}`, this);
  }

  create() {
    const coords = this.state.coords;
    let mesh = null;

    this.container = Atlas.get(
      this.state.type + "AnimatedUnit"
    ).instantiateModelsToScene();
    setTimeout(() => {
      this.playAnimation("Idle");
    }, Math.floor(Math.random() * Math.floor(2000)));
    mesh = this.container.rootNodes[0];
    this.meshRotation = 0;
    mesh.enablePointerMoveEvents = true;
    mesh.position.x = this.getHorizontalMeshCoordinate(coords.x);
    mesh.position.y = this.getVerticalMeshCoordinate(coords.y);
    mesh.position.z = this.getHorizontalMeshCoordinate(coords.z);
    mesh.metadata = this.state;

    this.createPlayerTorus();
    this.setShield();

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

    mesh.actionManager = this.createActionManager();
    mesh.setEnabled(true);
    mesh.freezeWorldMatrix();
    mesh.cullingStrategy =
      BABYLON.AbstractMesh.CULLINGSTRATEGY_OPTIMISTIC_INCLUSION_THEN_BSPHERE_ONLY;
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
    torusMaterial.freeze();
    this.playerTorus.material = torusMaterial;
  }

  setShield() {
    if (
      (this.state.shield === undefined ||
        this.state.shield === null ||
        this.state.shield === 0) &&
      this.shieldMesh !== null
    ) {
      this.shieldMesh.dispose();
      this.shieldMesh = null;
    } else if (this.state.shield > 0 && this.shieldMesh === null) {
      const coords = this.state.coords;
      this.shieldMesh = BABYLON.MeshBuilder.CreateSphere(
        `shield-${this.state.id}`,
        { diameter: boardConfig.cellSize * this.state.size },
        this.scene
      );
      let mat = new BABYLON.StandardMaterial("shieldMat", this.scene);
      mat.diffuseColor = BABYLON.Color3.White();
      mat.alpha = 0.5;
      mat.freeze();
      this.shieldMesh.material = mat;
      this.shieldMesh.position.x = this.getHorizontalMeshCoordinate(coords.x);
      this.shieldMesh.position.y = this.getVerticalMeshCoordinate(coords.y);
      this.shieldMesh.position.z = this.getHorizontalMeshCoordinate(coords.z);
      this.shieldMesh.actionManager = this.createActionManager();
    }
  }

  createActionManager() {
    let actionManager = new BABYLON.ActionManager(this.scene);
    actionManager.isRecursive = true;
    actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          EventBus.$emit("pointer-over-unit", this);
        }
      )
    );
    actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        EventBus.$emit("click-unit", this);
      })
    );
    actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          EventBus.$emit("pointer-out-unit", this);
        }
      )
    );
    return actionManager;
  }

  update() {
    if (this.state.state == MOVING) {
      this.mesh.unfreezeWorldMatrix();
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
      if (this.shieldMesh !== null) {
        this.shieldMesh.position.x = newX;
        this.shieldMesh.position.y = newY;
        this.shieldMesh.position.z = newZ;
      }
      if (
        newX == targetCoords.x &&
        newY == targetCoords.y &&
        newZ == targetCoords.z
      ) {
        this.playAnimation("Idle");
        this.state.stop();
        this.mesh.freezeWorldMatrix();
        EventBus.$emit("animation-finished");
      }
    }
  }

  showShootingParams() {
    const params = this.state.defaultShootParams;
    const coords = this.state.coords;
    Object.keys(params).forEach(distance => {
      const color = this.shootHitProbabilityColor(params[distance]);
      for (let x = coords.x - distance; x <= coords.x + distance; x++) {
        distance = parseInt(distance);
        let z = coords.z - distance;
        if (x >= 0 && x <= 19 && z >= 0 && z <= 19) {
          const mesh = this.createGroundArea(
            { x: x, y: coords.y + 0.01, z: z },
            color
          );
          this.shootAreaMeshes.push(mesh);
        }
        z = coords.z + distance;
        if (x >= 0 && x <= 19 && z >= 0 && z <= 19) {
          const mesh = this.createGroundArea(
            { x: x, y: coords.y + 0.01, z: z },
            color
          );
          this.shootAreaMeshes.push(mesh);
        }
      }
      for (let z = coords.z - distance + 1; z <= coords.z + distance - 1; z++) {
        distance = parseInt(distance);
        let x = coords.x - distance;
        if (x >= 0 && x <= 19 && z >= 0 && z <= 19) {
          const mesh = this.createGroundArea(
            { x: x, y: coords.y + 0.01, z: z },
            color
          );
          this.shootAreaMeshes.push(mesh);
        }
        x = coords.x + distance;
        if (x >= 0 && x <= 19 && z >= 0 && z <= 19) {
          const mesh = this.createGroundArea(
            { x: x, y: coords.y + 0.01, z: z },
            color
          );
          this.shootAreaMeshes.push(mesh);
        }
      }
    });
  }

  createGroundArea(coords, color) {
    let mesh = BABYLON.MeshBuilder.CreateGround(
      `shooting-${this.state.id}`,
      { width: boardConfig.cellSize, height: boardConfig.cellSize },
      this.scene
    );
    let mat = new BABYLON.StandardMaterial(
      `shootingMat-unit-${this.state.id}`,
      this.scene
    );
    mat.diffuseColor = color;
    mat.alpha = 0.3;
    mesh.material = mat;
    mesh.position.x = this.getHorizontalMeshCoordinate(coords.x);
    mesh.position.y = this.getVerticalMeshCoordinate(coords.y);
    mesh.position.z = this.getHorizontalMeshCoordinate(coords.z);
    return mesh;
  }

  shootHitProbabilityColor(params) {
    const hit = params.find(p => p.outcome == "hit");
    const miss = params.find(p => p.outcome == "miss");
    let hitProbability = 1;
    if (miss !== undefined) {
      hitProbability = hitProbability / (hit["weight"] + miss["weight"]);
    }
    if (hitProbability == 1) {
      return BABYLON.Color3.Green();
    } else if (hitProbability < 1 && hitProbability >= 0.75) {
      return BABYLON.Color3.Teal();
    } else if (hitProbability < 0.75 && hitProbability >= 0.5) {
      return BABYLON.Color3.Yellow();
    } else if (hitProbability < 0.5 && hitProbability >= 0.25) {
      return BABYLON.Color3.Red();
    } else if (hitProbability < 0.25) {
      return BABYLON.Color3.Black();
    }
    return BABYLON.Color3.Black();
  }

  hideShootingParams() {
    this.shootAreaMeshes.forEach(mesh => {
      mesh.dispose();
    });
    this.shootAreaMeshes = [];
  }

  remove() {
    this.playAnimation("Die", false, () => {
      EventBus.$emit("pointer-out-unit", this);
      GameObserver.removeRenderObserver(`unit-${this.state.id}`);
      EventBus.$off("scene-created", this.sceneCreatedCallback);
      EventBus.$off("unit-selected", this.unitSelectedCallback);
      EventBus.$off("unit-deselected", this.unitDeselectedCallback);
      GameObserver.unhighlight(this.mesh, "levelup");
      this.mesh.dispose();
      this.playerTorus.dispose();
      this.mesh = null;
      this.playerTorus = null;
      this.state = null;
      this.container = null;
      EventBus.$emit("animation-finished");
    });
  }

  attack() {
    this.playAnimation("Attack", false, () => {
      EventBus.$emit("animation-finished");
    });
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
    return coordinate * boardConfig.cellSize + boardConfig.cellSize;
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
      // If animation for this unit does not exist
      if (this.currentAnimation != name && endCallback) {
        endCallback();
      }
    }
  }
}

export default UnitObserver;
