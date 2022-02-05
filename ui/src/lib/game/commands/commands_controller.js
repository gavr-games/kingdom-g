import { EventBus } from "@/lib/event_bus";

const BLOCKING_COMMANDS = ["move-object", "attack", "destroy-object"];

class CommandsController {
  init(gameData) {
    this.cmdQueue = [];
    this.isBlocked = false;
    this.handleCommandsCallback = payload => {
      this.handleCommands(payload);
    };
    this.animationFinishedCallback = () => {
      this.isBlocked = false;
      this.executeNextCommand();
    };
    EventBus.$on(
      `received-game:${gameData.id}-msg`,
      this.handleCommandsCallback
    );
    EventBus.$on("animation-finished", this.animationFinishedCallback);
  }

  handleCommands(payload) {
    if (payload.reply_type === "commands") {
      const cmdCount = this.cmdQueue.length;
      Array.prototype.push.apply(this.cmdQueue, payload.commands);
      if (cmdCount == 0 && !this.isBlocked) {
        // start queue if it was empty
        this.executeNextCommand();
      }
    }
  }

  executeNextCommand() {
    if (this.cmdQueue.length > 0) {
      const cmd = this.cmdQueue.shift();
      window.client.api.apply_command(cmd);
      if (BLOCKING_COMMANDS.includes(cmd.command)) {
        this.isBlocked = true;
      }
      EventBus.$emit(`command-${cmd.command}`, cmd);
      if (!BLOCKING_COMMANDS.includes(cmd.command)) {
        this.executeNextCommand();
      }
    }
  }
}
const commandsController = new CommandsController();

export default commandsController;
