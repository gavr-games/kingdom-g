import Coords from "../../utils/coords";
import boardConfig from "./config";
import Atlas from "../atlas/atlas";
import Unit from "../units/unit";

class Board {
  constructor(scene, gamePayload) {
    this.scene = scene;
    this.cells = [];
    this.units = [];
    this.gamePayload = gamePayload;
  }

  create() {
    // Add cells
    for (const coordsKey in this.gamePayload.board) {
      let coords = Coords.parse(coordsKey);
      let mesh = Atlas.get("solidFill").clone();
      mesh.visibility = 1;
      mesh.position.x = coords.x * boardConfig.cellSize;
      mesh.position.y = -2 + coords.y * boardConfig.cellSize;
      mesh.position.z = boardConfig.cellSize + coords.z * boardConfig.cellSize;
      mesh.metadata = {
        type: "cell",
        fill: "solid",
        originalCoords: coordsKey
      };
      this.cells.push(mesh);
    }
    // Add objects
    for (const objId in this.gamePayload.objects) {
      if (this.gamePayload.objects[objId]["class"] == "unit") {
        let unit = new Unit(this.scene, this.gamePayload.objects[objId]);
        unit.create();
        this.units.push(unit);
      }
    }
  }
}

export default Board;
