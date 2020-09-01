import { EventBus } from "@/lib/event_bus";
import GameState from "@/lib/game/game_state";
import GameObserver from "@/lib/game/game_observer";

class UnitMoveAction {
  constructor(unitObserver) {
    this.unitObserver = unitObserver;
    this.path = null;
    if (
      GameState.isMyTurn() &&
      unitObserver.state.player === GameState.getMyPlayerId()
    ) {
      GameObserver.highlight(this.unitObserver.mesh);
    } else {
      EventBus.$emit("abort-action", this);
      return;
    }
    this.pointerOverCellCallback = cellObserver => {
      this.handlePointerOverCell(cellObserver);
    };
    this.pointerOutCellCallback = cellObserver => {
      this.handlePointerOutCell(cellObserver);
    };
    this.clickCellCallback = cellObserver => {
      this.handleClickCell(cellObserver);
    };
    EventBus.$on("pointer-over-cell", this.pointerOverCellCallback);
    EventBus.$on("pointer-out-cell", this.pointerOutCellCallback);
    EventBus.$on("click-cell", this.clickCellCallback);
    EventBus.$emit("unit-selected", unitObserver);
  }

  handlePointerOverCell(cellObserver) {
    this.path = window.client.api.find_path(
      parseInt(this.unitObserver.state.id),
      cellObserver.state.payload
    );
    if (this.path !== null) {
      EventBus.$emit("highlight-path", this.path);
    }
  }

  handlePointerOutCell() {
    if (this.path !== null) {
      EventBus.$emit("unhighlight-path", this.path);
    }
    this.path = null;
  }

  handleClickCell(cellObserver) {
    let path = window.client.api.find_path(
      parseInt(this.unitObserver.state.id),
      cellObserver.state.payload
    );
    if (path === null) {
      return;
    }
    let actionParams = [];
    path.forEach(step => {
      actionParams.push({
        action: "move",
        parameters: {
          "obj-id": this.unitObserver.state.id,
          "new-position": step
        }
      });
    });
    EventBus.$emit("perform-action", actionParams);
  }

  cancel() {
    GameObserver.unhighlight(this.unitObserver.mesh);
    if (this.path !== null) {
      EventBus.$emit("unhighlight-path", this.path);
    }
    EventBus.$off("pointer-over-cell", this.pointerOverCellCallback);
    EventBus.$off("pointer-out-cell", this.pointerOutCellCallback);
    EventBus.$off("click-cell", this.clickCellCallback);
    EventBus.$emit("unit-deselected", this.unitObserver);
  }
}

export default UnitMoveAction;
