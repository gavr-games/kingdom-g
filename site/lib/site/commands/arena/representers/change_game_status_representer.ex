defmodule Site.Commands.Arena.Representers.ChangeGameStatusRepresenter do
  alias Site.Commands.Arena.Representers.{GameRepresenter}

  def call(game) do
    %{
      action: "command",
      data: %{
        command: "change_game_status",
        params: %{
          game_id: game.id,
          status: game.status
        }
      }
    }
  end
end
