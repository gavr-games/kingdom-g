import CellController from "@/lib/game/cells/cell_controller";
import UnitController from "@/lib/game/units/unit_controller";
import BuildingController from "@/lib/game/buildings/building_controller";

class BoardController {
  init() {
    this.cells = [];
    this.units = [];
    this.buildings = [];
    this.create();
  }

  create() {
    // Add cells
    let allCoords = window.client.api.get_all_coords();
    for (const coordsKey in allCoords) {
      let cell = new CellController(coordsKey, allCoords[coordsKey]);
      this.cells.push(cell);
    }
    // Add objects
    let allObjects = window.client.api.get_object_ids();
    for (const objId in allObjects) {
      let obj = window.client.api.get_object(parseInt(objId));
      // units
      if (obj["class"] == "unit") {
        let unit = new UnitController(objId);
        this.units.push(unit);
      }
      // buildings
      if (obj["class"] == "building") {
        let building = new BuildingController(objId);
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

const boardController = new BoardController();

export default boardController;
