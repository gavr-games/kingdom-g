defmodule Site.Commands.Arena.Representers.GameRepresenter do
  def call(game) do
    %{
      id: game.id,
      title: game.title,
      owner_id: game.owner_id,
      mode_id: game.mode_id,
      status: game.status,
      time_limit: game.time_limit,
      has_password: game.password != nil && String.length(game.password) == 0,
      owner: %{
        username: game.owner.username
      }
    }
  end
end
