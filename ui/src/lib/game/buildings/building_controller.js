import BuildingObserver from "@/lib/game/buildings/building_observer";
import BuildingState from "@/lib/game/buildings/building_state";

class BuildingController {
  constructor(id) {
    this.state = new BuildingState(id);
    this.observer = new BuildingObserver(this.state);
  }
}

export default BuildingController;
