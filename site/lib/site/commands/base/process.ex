defmodule Site.Commands.Base.Process do
  import Monad.Result
  alias Site.User.Operations.{Create, GenerateToken, Authenticate}

  def call(%{"action" => action, "data" => data}) do
    case action do
      "signup" ->
        result = Create.call(data)
        if success?(result) do
          user = unwrap!(result)
          {:ok, %{data: %{id: user.id, token: GenerateToken.call(user)}} }
        else
          {:error, %{code: result.error}}
        end
      "login" ->
        result = Authenticate.call(data)
        if success?(result) do
          user = unwrap!(result)
          {:ok, %{data: %{id: user.id, token: GenerateToken.call(user)}} }
        else
          {:error, %{code: result.error}}
        end
    end
  end
end
