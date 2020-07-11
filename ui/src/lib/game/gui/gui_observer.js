import { EventBus } from "@/lib/event_bus";
import * as GUI from "babylonjs-gui";

class GuiObserver {
  init() {
    this.scene = null;
    this.gui = null;
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
  }

  create() {
    this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("gui_panels");
    EventBus.$emit("gui-created", this.gui);
  }
}
const guiObserver = new GuiObserver();

export default guiObserver;
