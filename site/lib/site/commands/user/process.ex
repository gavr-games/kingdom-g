defmodule Site.Commands.User.Process do
  import Monad.Result
  alias Site.User.Operations.{CheckLocation}

  def call(%{"action" => action, "data" => data}, user_id) do
    case action do
      "check_location" ->
        result = CheckLocation.call(user_id)
        if success?(result) do
          {:ok, %{data: %{location: unwrap!(result)}} }
        else
          {:error, %{code: result.error}}
        end
    end
  end
end
