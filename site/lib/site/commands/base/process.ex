defmodule Site.Commands.Base.Process do
  import Monad.Result
  alias Site.User.Operations.{Create, GenerateToken}

  def call(%{"action" => action, "data" => data}) do
    case action do
      "signup" ->
        result = Create.call(data)
        if success?(result) do
          {:ok, %{data: %{token: GenerateToken.call(unwrap!(result))}} }
        else
          {:error, %{code: result.error}}
        end
    end
  end
end
