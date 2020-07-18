import * as BABYLON from "babylonjs";
import { EventBus } from "@/lib/event_bus";
import boardConfig from "@/lib/game/board/config";
import Atlas from "@/lib/game/atlas/atlas";
import Path from "@/lib/utils/path";
import GameObserver from "@/lib/game/game_observer";

class CellObserver {
  constructor(state) {
    this.scene = null;
    this.state = state;
    this.mesh = null;
    EventBus.$on("scene-created", scene => {
      this.scene = scene;
      this.create();
    });
    EventBus.$on("highlight-path", path => {
      if (Path.includesPosition(path, this.state.payload)) {
        GameObserver.highlight(this.mesh);
      }
    });
    EventBus.$on("unhighlight-path", path => {
      if (Path.includesPosition(path, this.state.payload)) {
        GameObserver.unhighlight(this.mesh);
      }
    });
  }

  create() {
    let mesh = Atlas.get("solidFill").clone();
    let coords = this.state.coords;
    mesh.visibility = 1;
    mesh.name = "cell" + this.state.coordsKey;
    mesh.position.x = coords.x * boardConfig.cellSize;
    mesh.position.y = -2 + coords.y * boardConfig.cellSize;
    mesh.position.z = boardConfig.cellSize + coords.z * boardConfig.cellSize;
    mesh.metadata = {
      type: "cell",
      fill: "solid",
      originalCoords: this.coordsKey,
      state: this.state
    };
    mesh.actionManager = new BABYLON.ActionManager(this.scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          EventBus.$emit("pointer-over-cell", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          EventBus.$emit("pointer-out-cell", this);
        }
      )
    );
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        EventBus.$emit("click-cell", this);
      })
    );
    mesh.setEnabled(true);
    this.mesh = mesh;
  }
}

export default CellObserver;
