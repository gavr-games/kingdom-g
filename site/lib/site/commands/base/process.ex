defmodule Site.Commands.Base.Process do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  import Monad.Result
  alias Site.User.Operations.Create

  def call(%{"action" => action, "data" => data}) do
    case action do
      "signup" ->
        result = Create.call(data)
        if success?(result) do
          {:ok, %{token: "sample_token"}}
        else
          {:error, %{code: ErrCodes.server_error}}
        end
    end
  end
end
