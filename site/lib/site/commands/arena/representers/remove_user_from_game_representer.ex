defmodule Site.Commands.Arena.Representers.RemoveUserFromGameRepresenter do
  def call(game, user_id) do
    %{
      action: "command",
      data: %{
        command: "remove_user_from_game",
        params: %{game_id: game.id, user_id: user_id}
      }
    }
  end
end
