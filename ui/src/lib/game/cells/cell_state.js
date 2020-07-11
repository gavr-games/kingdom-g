import Coords from "@/lib/utils/coords";

class CellState {
  constructor(coordsKey, cell) {
    this.coords = Coords.parsePosition(cell);
    this.payload = cell;
    this.coordsKey = coordsKey;
  }
}

export default CellState;
