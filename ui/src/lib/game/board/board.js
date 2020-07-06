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
    let allObjects = window.client.api.get_object_ids();
    for (const objId in allObjects) {
      let obj = window.client.api.get_object(parseInt(objId));
      // units
      if (obj["class"] == "unit") {
        let unit = new Unit(this.scene, obj);
        unit.create();
        this.units.push(unit);
      }
      // buildings
      if (obj["class"] == "building") {
        let building = new Building(this.scene, obj);
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
