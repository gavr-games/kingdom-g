import { EventBus } from "@/lib/event_bus";
import UnitObserver from "@/lib/game/units/unit_observer";
import { UnitState } from "@/lib/game/units/unit_state";

class UnitController {
  constructor(id) {
    this.state = new UnitState(id);
    this.observer = new UnitObserver(this.state);
    this.handleMoveObjectCallback = cmd => {
      this.handleMoveObject(cmd);
    };
    this.handleAttackCallback = cmd => {
      this.handleAttack(cmd);
    };
    this.handleSetExperienceCallback = cmd => {
      this.handleSetExperience(cmd);
    };
    this.handleSetShieldCallback = cmd => {
      this.handleSetShield(cmd);
    };
    EventBus.$on("command-move-object", this.handleMoveObjectCallback);
    EventBus.$on("command-attack", this.handleAttackCallback);
    EventBus.$on("command-set-experience", this.handleSetExperienceCallback);
    EventBus.$on("command-set-level", this.handleSetExperienceCallback);
    EventBus.$on("command-set-shield", this.handleSetShieldCallback);
  }

  handleMoveObject(cmd) {
    if (cmd.object_id === this.state.id) {
      this.state.moveToPosition(cmd.position);
    }
  }

  handleAttack(cmd) {
    if (cmd.attacker_id === this.state.id) {
      this.observer.attack(cmd);
    }
  }

  handleSetExperience(cmd) {
    if (cmd.object_id === this.state.id) {
      this.observer.checkCanLevelUp();
    }
  }

  handleSetShield(cmd) {
    if (cmd.object_id === this.state.id) {
      this.observer.setShield();
    }
  }

  remove() {
    this.observer.remove();
    this.observer = null;
    this.state = null;
    EventBus.$off("command-move-object", this.handleMoveObjectCallback);
    EventBus.$off("command-attack", this.handleAttackCallback);
    EventBus.$off("command-set-experience", this.handleSetExperienceCallback);
    EventBus.$off("command-set-level", this.handleSetExperienceCallback);
  }
}

export default UnitController;
