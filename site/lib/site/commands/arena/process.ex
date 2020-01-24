defmodule Site.Commands.Arena.Process do
  import Monad.Result
  alias Site.Game.Operations.{Create, GetActiveList, Join}
  alias Site.Commands.Arena.Representers.{AddGameRepresenter, AddUserToGameRepresenter, GameRepresenter}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "create_game" ->
        result = Join.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddUserToGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}}}
        else
          {:error, %{code: result.error}}
        end
      "join_game" ->
        result = Create.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddGameRepresenter.call(GetCurrentGame.call(user_id))
          SiteWeb.Endpoint.broadcast "arena", "msg", AddUserToGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}}}
        else
          {:error, %{code: result.error}}
        end
      "get_games" ->
        games = GetActiveList.call()
          |> Enum.map(fn game -> GameRepresenter.call(game) end)
        {:ok, %{data: games}}
    end
  end
end
