import * as GUI from "babylonjs-gui";
import { EventBus } from "@/lib/event_bus";

class PlayersPanelObserver {
  init(state) {
    this.gui = null;
    this.state = state;
    this.players = [];
    EventBus.$on("gui-created", gui => {
      this.gui = gui;
      this.create();
    });
  }

  create() {
    let plane = new GUI.StackPanel();
    plane.background = "black";
    plane.height = "200px";
    plane.alpha = 0.8;
    plane.width = "150px";
    plane.color = "#e74004";
    plane.linkOffsetY = 10;
    plane.top = "1%";
    plane.left = "1%";
    plane.zIndex = 5;
    plane.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    plane.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.gui.addControl(plane);
    let heading = new GUI.TextBlock();
    heading.text = "Players:";
    heading.color = "white";
    heading.fontSize = 24;
    heading.height = "40px";
    heading.width = "150px";
    heading.textWrapping = true;
    plane.addControl(heading);
    this.state.players.forEach(player => {
      let pText = new GUI.TextBlock();
      pText.text = `${player.username} (${player.gold})`;
      pText.color = player.active ? "white" : "grey";
      pText.fontSize = 18;
      pText.height = "30px";
      pText.width = "150px";
      plane.addControl(pText);
      this.players.push({
        id: player.id,
        text: pText
      });
    });
  }

  update() {
    this.state.players.forEach(player => {
      let pText = this.players.find(p => p.id === player.id).text;
      pText.text = `${player.username} (${player.gold})`;
      pText.color = player.active ? "white" : "grey";
    });
  }
}

const playersPanelObserver = new PlayersPanelObserver();

export default playersPanelObserver;
