import Cell from "../cells/cell";
import Unit from "../units/unit";
import Building from "../buildings/building";

class Board {
  constructor(scene) {
    this.scene = scene;
    this.cells = [];
    this.units = [];
    this.buildings = [];
  }

  create() {
    // Add cells
    let allCoords = window.client.api.get_all_coords();
    for (const coordsKey in allCoords) {
      let cell = new Cell(this.scene, coordsKey, allCoords[coordsKey]);
      cell.create();
      this.cells.push(cell);
    }
    // Add objects
    let allObjects = window.client.api.get_objects();
    for (const objId in allObjects) {
      // units
      if (allObjects[objId]["class"] == "unit") {
        let unit = new Unit(this.scene, allObjects[objId]);
        unit.create();
        this.units.push(unit);
      }
      // buildings
      if (allObjects[objId]["class"] == "building") {
        let building = new Building(this.scene, allObjects[objId]);
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
