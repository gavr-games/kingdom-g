import { EventBus } from "@/lib/event_bus";

const IDLE = 0,
  MY_TURN = 1,
  UNIT_SELECTED = 2;

class GameState {
  constructor() {
    this.state = IDLE;
    this.currentPLayer = null;
    this.selectedUnit = null;
    this.payload = null;
    EventBus.$on("selected-unit", unit => {
      this.selectedUnit = unit;
      this.state = UNIT_SELECTED;
    });
    EventBus.$on("deselected-unit", () => {
      this.selectedUnit = null;
      //TODO: what state it should be?
      this.state = MY_TURN;
    });
  }

  init(gamePayload) {
    this.payload = gamePayload;
    //TODO: check pyalod
    this.state = MY_TURN;
  }

  canMove() {
    return this.state == MY_TURN;
  }

  canSelectCell() {
    return this.state == UNIT_SELECTED;
  }
}

const gameState = new GameState();

export default gameState;
