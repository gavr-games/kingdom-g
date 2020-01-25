defmodule Site.Commands.Arena.Representers.RemoveGameRepresenter do
  def call(game) do
    %{
      action: "command",
      data: %{
        command: "remove_game",
        params: %{game_id: game.id}
      }
    }
  end
end
