defmodule Site.Commands.Arena.Process do
  import Monad.Result
  alias Site.Game.Operations.{Create, GetActiveList, Join, Exit, Start}
  alias Site.Commands.Arena.Representers.{
    AddGameRepresenter,
    AddUserToGameRepresenter,
    RemoveGameRepresenter,
    RemoveUserFromGameRepresenter,
    GameRepresenter,
    ChangeGameStatusRepresenter
  }
  alias Site.User.Operations.GetCurrentGame

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "join_game" ->
        result = Join.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddUserToGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}}}
        else
          {:error, %{code: result.error}}
        end
      "create_game" ->
        result = Create.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddGameRepresenter.call(GetCurrentGame.call(user_id))
          SiteWeb.Endpoint.broadcast "arena", "msg", AddUserToGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}}}
        else
          {:error, %{code: result.error}}
        end
      "exit_game" ->
        result = Exit.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          if game.status == "deleted" do
            SiteWeb.Endpoint.broadcast "arena", "msg", RemoveGameRepresenter.call(game)
          end
          SiteWeb.Endpoint.broadcast "arena", "msg", RemoveUserFromGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}}}
        else
          {:error, %{code: result.error}}
        end
      "start_game" ->
        result = Start.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", ChangeGameStatusRepresenter.call(game)
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
