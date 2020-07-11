import GameState from "@/lib/game/game_state";
import GameObserver from "@/lib/game/game_observer";
import BoardController from "@/lib/game/board/board_controller";
import GuiController from "@/lib/game/gui/gui_controller";
import ActionsController from "@/lib/game/actions/actions_controller";
import CommandsController from "@/lib/game/commands/commands_controller";

class GameController {
  init(gameData, myUserId) {
    BoardController.init();
    GuiController.init();
    ActionsController.init();
    GameState.init(gameData, myUserId);
    GameObserver.init();
    CommandsController.init(gameData);
  }
}

const gameController = new GameController();

export default gameController;
