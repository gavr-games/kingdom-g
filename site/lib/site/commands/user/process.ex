defmodule Site.Commands.User.Process do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  import Monad.Result
  alias Site.User.Operations.{CheckLocation, Get, GetCurrentGame}
  alias Site.Commands.Arena.Representers.{GameRepresenter}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "check_location" ->
        result = CheckLocation.call(user_id)
        if success?(result) do
          {:ok, %{data: %{location: unwrap!(result)}} }
        else
          {:error, %{code: result.error}}
        end
      "get_my_profile" ->
        result = Get.call(user_id)
        if success?(result) do
          {:ok, %{data: unwrap!(result)} }
        else
          {:error, %{code: result.error}}
        end
      "get_my_game" ->
        case GetCurrentGame.call(user_id) do
          nil ->
            {:ok, %{data: %{}}}
          game ->
            {:ok, %{data: GameRepresenter.call(game)}}
        end
    end
  end
end
