import GuiObserver from "@/lib/game/gui/gui_observer";
import PlayersPanelController from "@/lib/game/gui/players_panel/players_panel_controller"

class GuiController {
  init() {
    GuiObserver.init();
    PlayersPanelController.init();
  }
}
const guiController = new GuiController();

export default guiController;
