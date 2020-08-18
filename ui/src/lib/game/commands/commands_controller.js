import { EventBus } from "@/lib/event_bus";

class CommandsController {
  init(gameData) {
    EventBus.$on(`received-game:${gameData.id}-msg`, this.handleCommands);
  }

  handleCommands(payload) {
    if (payload.reply_type === "commands") {
      payload.commands.forEach(cmd => {
        window.client.api.apply_command(cmd);
        EventBus.$emit(`command-${cmd.command}`, cmd);
      });
    }
  }
}
const commandsController = new CommandsController();

export default commandsController;
