import { EventBus } from "@/lib/event_bus";
import UnitObserver from "@/lib/game/units/unit_observer";
import { UnitState } from "@/lib/game/units/unit_state";

class UnitController {
  constructor(id) {
    this.state = new UnitState(id);
    this.observer = new UnitObserver(this.state);
    this.handleMoveObjectCallback = cmd => {
      this.handleMoveObject(cmd);
    };
    EventBus.$on("command-move-object", this.handleMoveObjectCallback);
  }

  handleMoveObject(cmd) {
    if (cmd.object_id === this.state.id) {
      this.state.moveToPosition(cmd.position);
    }
  }

  remove() {
    EventBus.$off("command-move-object", this.handleMoveObjectCallback);
  }
}

export default UnitController;
