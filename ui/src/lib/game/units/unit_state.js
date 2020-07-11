import Coords from "@/lib/utils/coords";
import { EventBus } from "@/lib/event_bus";

const STOPPED = 0,
  MOVING = 1;

class UnitState {
  constructor(id) {
    this.id = parseInt(id);
    this.state = STOPPED;
    this.targetPosition = null; //where to move (animation)
    EventBus.$on("move-unit-animation-finished", unitObserver => {
      if (this.id === unitObserver.state.id) {
        this.state = STOPPED;
        this.targetCoords = null;
      }
    });
  }

  get type() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.type;
  }

  get coords() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return Coords.parsePosition(obj.position);
  }

  get player() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.player;
  }

  moveToPosition(position) {
    this.targetPosition = position;
    this.state = MOVING;
  }

  stop() {
    this.targetPosition = null;
    this.state = STOPPED;
  }
}

export { STOPPED, MOVING, UnitState };
