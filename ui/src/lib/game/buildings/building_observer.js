import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";

class BuildingObserver {
  constructor(state) {
    this.scene = null;
    this.state = state;
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
  }

  create() {
    let coords = this.state.coords;
    if (coords.x == 19) {
      coords.x = 19;
      coords.z = 19;
    }
    let mesh = Atlas.get(this.state.type + "Building").clone();
    let axis = new BABYLON.Vector3(0, 1, 0);
    let quaternion = new BABYLON.Quaternion.RotationAxis(
      axis,
      Math.PI + (this.state.rotation * Math.PI) / 2
    );
    mesh.position.x = coords.x * boardConfig.cellSize - boardConfig.cellSize;
    mesh.position.y = coords.y * boardConfig.cellSize;
    mesh.position.z = coords.z * boardConfig.cellSize + boardConfig.cellSize;
    mesh.rotationQuaternion = quaternion;
    mesh.visibility = 1;
    mesh.setEnabled(true);
    mesh.metadata = this.state;
  }
}

export default BuildingObserver;
