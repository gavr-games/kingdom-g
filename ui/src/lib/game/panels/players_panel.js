import * as GUI from "babylonjs-gui";

class PlayersPanel {
  constructor(gui) {
    this.gui = gui;
  }

  create() {
    let plane = new GUI.Rectangle("test");
    plane.background = "black";
    plane.height = "200px";
    plane.alpha = 0.3;
    plane.width = "150px";
    plane.cornerRadius = 10;
    plane.thickness = 2;
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
    heading.textWrapping = true;
    plane.addControl(heading);
  }
}

export default PlayersPanel;
