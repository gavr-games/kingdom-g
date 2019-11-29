import boardConfig from "./config";
import Atlas from "../atlas/atlas";

class Board {
  constructor(scene, gamePayload) {
    this.scene = scene;
    this.ground = null;
    this.gamePayload = gamePayload;
  }

  create() {
    // eslint-disable-next-line no-unused-vars
    for (const coordsKey in this.gamePayload.board) {
      let coords = this.getCoords(coordsKey);
      let mesh = Atlas.get("solidFill").clone();
      mesh.visibility = 1;
      mesh.position.x = coords.x * boardConfig.cellSize;
      mesh.position.y = -2 + coords.y * boardConfig.cellSize;
      mesh.position.z = boardConfig.cellSize + coords.z * boardConfig.cellSize;
    }
  }

  getCoords(coordsString) {
    let coords = {
      x: 0,
      y: 0,
      z: 0
    };
    coords.x = parseInt(coordsString.split(" ")[0].replace("[", ""));
    coords.z = parseInt(coordsString.split(" ")[1].replace("]", ""));
    return coords;
  }
}

export default Board;
