import PlayersPanelObserver from "@/lib/game/gui/players_panel/players_panel_observer";

class PlayersPanelController {
  init() {
    PlayersPanelObserver.init();
  }
}
const playersPanelController = new PlayersPanelController();

export default playersPanelController;
