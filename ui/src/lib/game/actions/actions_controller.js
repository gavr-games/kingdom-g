import { EventBus } from "@/lib/event_bus";
import Chain from "@/lib/utils/chain";
import MoveUnitAction from "@/lib/game/actions/move_unit_action";
import GameState from "@/lib/game/game_state";
import WSClient from "@/lib/ws/wsclient";

class ActionsController {
  init() {
    this.currentAction = null;
    this.unitClickChain = new Chain();
    this.unitClickChain.insert({
      id: "default-unit-click",
      func: this.handleUnitClick,
      ctx: this
    });
    EventBus.$on("click-unit", unitObserver => {
      this.unitClickChain.execute(unitObserver);
    });
    EventBus.$on("abort-action", () => {
      this.currentAction = null;
    });
    EventBus.$on("perform-action", actionParams => {
      this.performAction(actionParams);
    });
    EventBus.$on("keydown", key => {
      if (key === "Escape") {
        this.currentAction.cancel();
        this.currentAction = null;
      }
    });
  }

  performAction(actionParams) {
    this.currentAction.cancel();
    this.currentAction = null;
    WSClient.sendMsg(`game:${GameState.gameData.id}`, {
      action: "perform_action",
      data: actionParams
    });
  }

  handleUnitClick(unitObserver) {
    if (this.currentAction !== null) {
      this.currentAction.cancel();
      this.currentAction = null;
    }
    this.currentAction = new MoveUnitAction(unitObserver);
    return true;
  }
}
const actionsController = new ActionsController();

export default actionsController;
