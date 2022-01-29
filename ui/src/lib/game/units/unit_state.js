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

  get objectClass() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.class;
  }

  get actions() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.actions;
  }

  get coords() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return Coords.parsePosition(obj.position);
  }

  get player() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.player;
  }

  get attack() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.attack;
  }

  get health() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.health;
  }

  get maxHealth() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj["max_health"];
  }

  get level() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.level;
  }

  get moves() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.moves;
  }

  get maxMoves() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj["max_moves"];
  }

  get size() {
    return Math.ceil(
      Object.keys(window.client.api.get_object(parseInt(this.id)).coords)
        .length / 2
    );
  }

  get canLevelUp() {
    return window.client.api.can_levelup(parseInt(this.id));
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
