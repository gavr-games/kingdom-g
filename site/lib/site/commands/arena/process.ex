defmodule Site.Commands.Arena.Process do
  import Monad.Result
  alias Site.Game.Operations.{Create}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "create_game" ->
        result = Create.call(data, user_id)
        if success?(result) do
          game = unwrap!(result)
          #TODO: Send add game to arena
          #TODO: Send join to specific player
          {:ok, %{data: %{id: game.id}} }
        else
          {:error, %{code: result.error}}
        end
    end
  end
end
