import * as BABYLON from "babylonjs";
import Coords from "../../utils/coords";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";

class Building {
  constructor(scene, payload) {
    this.scene = scene;
    this.payload = payload;
  }

  create() {
    let coords = Coords.parsePosition(this.payload.position);
    if (coords.x == 19) {
      coords.x = 19;
      coords.z = 19;
    }
    let mesh = Atlas.get(this.payload.type + "Building").clone();
    let axis = new BABYLON.Vector3(0, 1, 0);
    let quaternion = new BABYLON.Quaternion.RotationAxis(
      axis,
      Math.PI + (this.payload.rotation * Math.PI) / 2
    );
    mesh.position.x = coords.x * boardConfig.cellSize - boardConfig.cellSize;
    mesh.position.y = coords.y * boardConfig.cellSize;
    mesh.position.z = coords.z * boardConfig.cellSize + boardConfig.cellSize;
    mesh.rotationQuaternion = quaternion;
    mesh.visibility = 1;
    mesh.metadata = this.payload;
  }
}

export default Building;
