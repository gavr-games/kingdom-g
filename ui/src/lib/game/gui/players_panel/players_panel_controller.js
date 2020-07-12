import { EventBus } from "@/lib/event_bus";
import PlayersPanelObserver from "@/lib/game/gui/players_panel/players_panel_observer";
import PlayersPanelState from "@/lib/game/gui/players_panel/players_panel_state";

class PlayersPanelController {
  init() {
    this.state = new PlayersPanelState();
    PlayersPanelObserver.init(this.state);
    EventBus.$on("command-set-active-player", () => {
      PlayersPanelObserver.update();
    });
  }
}
const playersPanelController = new PlayersPanelController();

export default playersPanelController;
