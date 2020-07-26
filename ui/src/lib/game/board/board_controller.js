import { EventBus } from "@/lib/event_bus";
import CellController from "@/lib/game/cells/cell_controller";
import UnitController from "@/lib/game/units/unit_controller";
import BuildingController from "@/lib/game/buildings/building_controller";

class BoardController {
  init() {
    this.cells = [];
    this.units = [];
    this.buildings = [];
    EventBus.$on(`command-destroy-object`, cmd => {
      this.destroyObject(parseInt(cmd.object_id));
    });
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
    for (const i in allObjects) {
      const objId = allObjects[i];
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

  destroyObject(id) {
    for (const i in this.units) {
      if (this.units[i].state.id === id) {
        this.units[i].remove();
      }
    }
    this.units = this.units.filter(u => u.state !== null);

    for (const i in this.buildings) {
      if (this.buildings[i].state.id === id) {
        this.buildings[i].remove();
      }
    }
    this.buildings = this.buildings.filter(b => b.state !== null);
  }
}

const boardController = new BoardController();

export default boardController;
