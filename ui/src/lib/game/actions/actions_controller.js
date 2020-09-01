import { EventBus } from "@/lib/event_bus";
import Chain from "@/lib/utils/chain";
import UnitMoveAction from "@/lib/game/actions/unit_move_action";
import UnitAttackAction from "@/lib/game/actions/unit_attack_action";
import UnitShootAction from "@/lib/game/actions/unit_shoot_action";
import GameState from "@/lib/game/game_state";
import BoardController from "@/lib/game/board/board_controller";
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
    this.buildingClickChain = new Chain();
    this.buildingClickChain.insert({
      id: "default-building-click",
      func: this.handleBuildingClick,
      ctx: this
    });
    EventBus.$on("click-unit", unitObserver => {
      this.unitClickChain.execute(unitObserver);
    });
    EventBus.$on("click-building", buildingObserver => {
      this.buildingClickChain.execute(buildingObserver);
    });
    EventBus.$on("abort-action", () => {
      this.currentAction = null;
    });
    EventBus.$on("perform-action", actionParams => {
      this.performAction(actionParams);
    });
    // Action is clicked from UI Actions Panel
    EventBus.$on("click-action", (action, state) => {
      this.handleActionClick(
        action,
        BoardController.getObjectObserver(state.id)
      );
    });
    EventBus.$on("keydown", key => {
      if (key === "Escape") {
        this.cancelAction();
      }
    });
    EventBus.$on("cancel-action", () => {
      this.cancelAction();
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
    this.cancelAction();
    this.currentAction = new UnitMoveAction(unitObserver);
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  handleBuildingClick(buildingObserver) {
    //TODO: implement building selection
    return true;
  }

  handleActionClick(action, objectObserver) {
    this.cancelAction();
    // Handle unit actions
    if (objectObserver.state.objectClass === "unit") {
      switch (action) {
        case "move":
          this.currentAction = new UnitMoveAction(objectObserver);
          break;
        case "attack":
          this.currentAction = new UnitAttackAction(objectObserver);
          break;
        case "shoot":
          this.currentAction = new UnitShootAction(objectObserver);
          break;
      }
    }
  }

  cancelAction() {
    if (this.currentAction !== null) {
      this.currentAction.cancel();
      this.currentAction = null;
    }
  }
}
const actionsController = new ActionsController();

export default actionsController;
