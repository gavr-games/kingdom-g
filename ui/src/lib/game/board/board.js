import Cell from "../cells/cell";
import Unit from "../units/unit";
import Building from "../buildings/building";

class Board {
  constructor(scene, gamePayload) {
    this.scene = scene;
    this.cells = [];
    this.units = [];
    this.buildings = [];
    this.gamePayload = gamePayload;
  }

  create() {
    // Add cells
    for (const coordsKey in this.gamePayload.board) {
      let cell = new Cell(
        this.scene,
        coordsKey,
        this.gamePayload.board[coordsKey]
      );
      cell.create();
      this.cells.push(cell);
    }
    // Add objects
    for (const objId in this.gamePayload.objects) {
      // units
      if (this.gamePayload.objects[objId]["class"] == "unit") {
        let unit = new Unit(this.scene, this.gamePayload.objects[objId]);
        unit.create();
        this.units.push(unit);
      }
      // buildings
      if (this.gamePayload.objects[objId]["class"] == "building") {
        let building = new Building(
          this.scene,
          this.gamePayload.objects[objId]
        );
        building.create();
        this.buildings.push(building);
      }
    }
  }

  update() {
    for (const i in this.units) {
      this.units[i].update();
    }
  }
}

export default Board;
