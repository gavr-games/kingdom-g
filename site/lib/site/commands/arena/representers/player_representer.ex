defmodule Site.Commands.Arena.Representers.PlayerRepresenter do
  def call(player) do
    %{
      id: player.id,
      user_id: player.user_id,
      game_id: player.game_id,
      username: player.user.username,
      team: player.team,
      is_observer: player.is_observer
    }
  end
end
