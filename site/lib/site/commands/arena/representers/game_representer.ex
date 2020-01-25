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
      has_password: game.password != nil && String.length(game.password) != 0,
    }
    |> conditional_insert_owner(game)
    |> conditional_insert_players(game)
    game_map
  end

  def conditional_insert_owner(game_map, game) do
    if Ecto.assoc_loaded?(game.owner) do
      Map.put(game_map, :owner, %{
        username: game.owner.username
      })
    else
      game_map
    end
  end

  def conditional_insert_players(game_map, game) do
    if Ecto.assoc_loaded?(game.players) do
      Map.put(game_map, :players, Enum.map(game.players, fn player -> PlayerRepresenter.call(player) end))
    else
      game_map
    end
  end
end
