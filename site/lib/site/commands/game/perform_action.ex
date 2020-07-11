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
        player = Enum.find(game.players, fn p -> p.user_id == user_id end)
        parameters = Map.put(parameters, :p, player.id)
        GameActions.publish(game.id, Jason.encode!(%{action: action, parameters: parameters}))
        {:ok, %{}}
    end
  end
end
