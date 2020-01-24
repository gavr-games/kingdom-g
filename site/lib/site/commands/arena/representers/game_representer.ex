defmodule Site.Commands.Arena.Representers.GameRepresenter do
  alias Site.Commands.Arena.Representers.PlayerRepresenter

  def call(game) do
    game_map = %{
      id: game.id,
      title: game.title,
      owner_id: game.owner_id,
      mode_id: game.mode_id,
      status: game.status,
      time_limit: game.time_limit,
      has_password: game.password != nil && String.length(game.password) == 0,
    }
    |> conditional_insert(game, :owner, %{
        username: game.owner.username
      })
    |> conditional_insert(game, :players, Enum.map(game.players, fn player -> PlayerRepresenter.call(player) end))
    game_map
  end

  def conditional_insert(game_map, game, key, value) do
    if Map.has_key?(game, key) do
      Map.put(game_map, key, value)
    else
      game_map
    end
  end

end
