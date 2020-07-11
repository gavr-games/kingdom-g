import GuiObserver from "@/lib/game/gui/gui_observer";

class GuiController {
  init() {
    GuiObserver.init();
  }
}
const guiController = new GuiController();

export default guiController;
