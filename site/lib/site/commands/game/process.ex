defmodule Site.Commands.Game.Process do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  import Monad.Result
  alias Site.Commands.Game.{PerformAction}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "perform_action" ->
        case PerformAction.call(%{"action" => data["action"], "parameters" => data["parameters"]}, user_id) do
          {:ok, answer} ->
            {:ok, answer}
          {:error, %{reason: "unauthorized"}} ->
            {:error, %{code: ErrCodes.user_not_in_game}}
        end
    end
  end
end
