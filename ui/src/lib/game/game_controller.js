import { EventBus } from "@/lib/event_bus";
import GameState from "@/lib/game/game_state";
import GameObserver from "@/lib/game/game_observer";
import BoardController from "@/lib/game/board/board_controller";
import ActionsController from "@/lib/game/actions/actions_controller";
import CommandsController from "@/lib/game/commands/commands_controller";
import ObjectPopupController from "@/lib/game/object_popup/object_popup_controller";

class GameController {
  init(gameData, myUserId) {
    BoardController.init();
    ActionsController.init();
    GameState.init(gameData, myUserId);
    GameObserver.init();
    CommandsController.init(gameData);
    ObjectPopupController.init();
    EventBus.$on(`received-user:${myUserId}-error`, payload => {
      alert(payload.error);
    });
  }
}

const gameController = new GameController();

export default gameController;
