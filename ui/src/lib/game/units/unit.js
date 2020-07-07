import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import Coords from "../../utils/coords";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";
import GameState from "../game_state";

const STOPPED = 0,
  MOVING = 1,
  SPEED = 0.2;

class Unit {
  constructor(scene, payload) {
    this.scene = scene;
    this.payload = payload;
    this.selected = false;
    this.mesh = null;
    this.state = STOPPED;
    this.targetCoords = null;
    EventBus.$on("unit-moved", unit => {
      if (unit === this) {
        this.selected = false;
      }
    });
  }

  create() {
    let coords = Coords.parsePosition(this.payload.position);
    let mesh = Atlas.get(this.payload.type + "Unit").clone();
    mesh.position.x =
      coords.x * boardConfig.cellSize + boardConfig.cellSize / 2;
    mesh.position.y = coords.y * boardConfig.cellSize;
    mesh.position.z =
      boardConfig.cellSize / 2 + coords.z * boardConfig.cellSize;
    mesh.visibility = 1;
    mesh.metadata = this.payload;

    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        if (this.selected) {
          this.selected = false;
          EventBus.$emit("deselected-unit", this);
          return;
        }
        if (!GameState.canMove()) {
          return;
        }
        //TODO: check unit can move
        this.selected = true;
        EventBus.$emit("selected-unit", this);
      })
    );
    this.mesh = mesh;
  }

  moveToCoords(targetCoords) {
    this.state = MOVING;
    this.targetCoords = targetCoords;
    console.log(targetCoords);
  }

  update() {
    if (this.state == MOVING) {
      let speedX = SPEED;
      let speedY = SPEED;
      let speedZ = SPEED;
      if (this.targetCoords.x < this.mesh.position.x) {
        speedX = -SPEED;
      }
      if (this.targetCoords.y < this.mesh.position.y) {
        speedY = -SPEED;
      }
      if (this.targetCoords.z < this.mesh.position.z) {
        speedZ = -SPEED;
      }
      let newX = this.mesh.position.x + speedX;
      let newY = this.mesh.position.y + speedY;
      let newZ = this.mesh.position.z + speedZ;
      if (
        (newX > this.targetCoords.x && speedX > 0) ||
        (newX < this.targetCoords.x && speedX < 0)
      ) {
        newX = this.targetCoords.x;
      }
      if (
        (newY > this.targetCoords.y && speedY > 0) ||
        (newY < this.targetCoords.y && speedY < 0)
      ) {
        newY = this.targetCoords.y;
      }
      if (
        (newZ > this.targetCoords.z && speedZ > 0) ||
        (newZ < this.targetCoords.z && speedZ < 0)
      ) {
        newZ = this.targetCoords.z;
      }
      this.mesh.position.x = newX;
      this.mesh.position.y = newY;
      this.mesh.position.z = newZ;
      if (
        newX == this.targetCoords.x &&
        newY == this.targetCoords.y &&
        newZ == this.targetCoords.z
      ) {
        this.state = STOPPED;
        this.targetCoords = null;
      }
    }
  }
}

export default Unit;
