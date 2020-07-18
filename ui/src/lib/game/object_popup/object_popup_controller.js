import ObjectPopupObserver from "@/lib/game/object_popup/object_popup_observer";

class ObjectPopupController {
  init() {
    ObjectPopupObserver.init();
  }
}

const objectPopupController = new ObjectPopupController();

export default objectPopupController;
