defmodule Site.Commands.Game.PerformAction do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  alias Site.User.Operations.GetCurrentGame
  import Monad.Result
  alias Site.Rabbitmq.GameActions

  def call(%{"action" => action, "parameters" => parameters}, user_id) do
    case GetCurrentGame.call(user_id) do
      nil ->
        {:error, %{reason: "unauthorized"}}
      game ->
        parameters = Map.put(parameters, :p, user_id)
        GameActions.publish(game.id, Jason.encode!(%{action: action, parameters: parameters}))
    end
  end
end
