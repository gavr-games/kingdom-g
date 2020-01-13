defmodule Site.User.Operations.CheckLocation do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.User

  def call(_user_id) do
    success("arena")
  end
end
