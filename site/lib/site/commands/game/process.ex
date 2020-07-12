defmodule Site.Commands.Game.Process do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  import Monad.Result
  alias Site.Commands.Game.{PerformAction}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "perform_action" ->
        success = Enum.map(data, fn act ->
          case PerformAction.call(%{"action" => act["action"], "parameters" => act["parameters"]}, user_id) do
            {:ok, answer} ->
              {:ok, answer}
            {:error, %{reason: "unauthorized"}} ->
              {:error, %{code: ErrCodes.user_not_in_game}}
          end
        end)
        |> Enum.all?(fn answer ->
          {result, _description} = answer
          result == :ok
        end)
        if success do
          {:ok, %{}}
        else
          {:error, %{code: ErrCodes.user_not_in_game}}
        end
    end
  end
end
