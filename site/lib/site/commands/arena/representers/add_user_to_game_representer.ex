defmodule Site.Commands.Arena.Representers.AddUserToGameRepresenter do
  def call(game, user_id) do
    %{
      action: "command",
      data: %{
        command: "add_user_to_game",
        params: %{game_id: game.id, user_id: user_id}
      }
    }
  end
end
