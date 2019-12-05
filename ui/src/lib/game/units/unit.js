import Coords from "../../utils/coords";
import boardConfig from "../board/config";
import Atlas from "../atlas/atlas";

class Unit {
  constructor(scene, payload) {
    this.scene = scene;
    this.payload = payload;
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
  }
}

export default Unit;
