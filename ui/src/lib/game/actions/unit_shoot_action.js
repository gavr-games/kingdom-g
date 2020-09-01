import { EventBus } from "@/lib/event_bus";
import GameState from "@/lib/game/game_state";
import GameObserver from "@/lib/game/game_observer";
import ActionsController from "@/lib/game/actions/actions_controller";

class UnitShootAction {
  constructor(unitObserver) {
    this.unitObserver = unitObserver;
    this.target = null;
    if (
      GameState.isMyTurn() &&
      unitObserver.state.player === GameState.getMyPlayerId()
    ) {
      GameObserver.highlight(this.unitObserver.mesh);
    } else {
      EventBus.$emit("abort-action", this);
      return;
    }
    this.pointerOverUnitCallback = unitObserver => {
      this.handlePointerOverUnit(unitObserver);
    };
    this.pointerOutUnitCallback = unitObserver => {
      this.handlePointerOutUnit(unitObserver);
    };
    this.pointerOverBuildingCallback = buildingObserver => {
      this.handlePointerOverBuilding(buildingObserver);
    };
    this.pointerOutBuildingCallback = buildingObserver => {
      this.handlePointerOutBuilding(buildingObserver);
    };
    EventBus.$on("pointer-over-unit", this.pointerOverUnitCallback);
    EventBus.$on("pointer-out-unit", this.pointerOutUnitCallback);
    EventBus.$on("pointer-over-building", this.pointerOverBuildingCallback);
    EventBus.$on("pointer-out-building", this.pointerOutBuildingCallback);
    ActionsController.unitClickChain.insertBefore("default-unit-click", {
      id: "shoot-unit-click",
      func: this.handleClickTarget,
      ctx: this
    });
    ActionsController.buildingClickChain.insertBefore(
      "default-building-click",
      {
        id: "shoot-building-click",
        func: this.handleClickTarget,
        ctx: this
      }
    );
    EventBus.$emit("unit-selected", unitObserver);
  }

  handlePointerOverUnit(unitObserver) {
    if (
      unitObserver.state.objectClass === "unit" &&
      unitObserver.state.id == this.unitObserver.state.id
    ) {
      // Can't attack itself
      return;
    }
    let shootOutcomes = window.client.api.shoot_outcomes(
      this.unitObserver.state.id,
      unitObserver.state.id
    );
    if (shootOutcomes == null) {
      // Can't shoot target
      return;
    }
    this.target = unitObserver;
    GameObserver.highlight(unitObserver.mesh, "target");
  }

  handlePointerOutUnit(unitObserver) {
    if (this.target !== null) {
      GameObserver.unhighlight(unitObserver.mesh, "target");
    }
    this.target = null;
  }

  handlePointerOverBuilding(buildingObserver) {
    this.target = buildingObserver;
    GameObserver.highlight(buildingObserver.mesh, "target");
  }

  handlePointerOutBuilding(buildingObserver) {
    if (this.target !== null) {
      GameObserver.unhighlight(buildingObserver.mesh, "target");
    }
    this.target = null;
  }

  // eslint-disable-next-line no-unused-vars
  handleClickTarget(targetObserver) {
    let actionParams = [];
    actionParams.push({
      action: "shoot",
      parameters: {
        "obj-id": this.unitObserver.state.id,
        "target-id": targetObserver.state.id
      }
    });
    EventBus.$emit("perform-action", actionParams);
    return false;
  }

  cancel() {
    GameObserver.unhighlight(this.unitObserver.mesh);
    if (this.target !== null) {
      GameObserver.unhighlight(this.target.mesh, "target");
    }
    EventBus.$off("pointer-over-unit", this.pointerOverUnitCallback);
    EventBus.$off("pointer-out-unit", this.pointerOutUnitCallback);
    EventBus.$off("pointer-over-building", this.pointerOverBuildingCallback);
    EventBus.$off("pointer-out-building", this.pointerOutBuildingCallback);
    ActionsController.unitClickChain.remove("shoot-unit-click");
    ActionsController.buildingClickChain.remove("shoot-building-click");
    EventBus.$emit("unit-deselected", this.unitObserver);
  }
}

export default UnitShootAction;
