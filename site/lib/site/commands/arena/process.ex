defmodule Site.Commands.Arena.Process do
  import Monad.Result
  alias Site.Game.Operations.{Create}
  alias Site.Commands.Arena.Representers.{AddGameRepresenter, AddUserToGameRepresenter}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "create_game" ->
        result = Create.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddGameRepresenter.call(game)
          SiteWeb.Endpoint.broadcast "arena", "msg", AddUserToGameRepresenter.call(game, user_id)
          {:ok, %{data: %{id: game.id}} }
        else
          {:error, %{code: result.error}}
        end
    end
  end
end
