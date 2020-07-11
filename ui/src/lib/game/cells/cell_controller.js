import CellObserver from "@/lib/game/cells/cell_observer";
import CellState from "@/lib/game/cells/cell_state";

class CellController {
  constructor(coordsKey, cell) {
    this.state = new CellState(coordsKey, cell);
    this.observer = new CellObserver(this.state);
  }
}

export default CellController;
