defmodule Site.User.Operations.Get do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.User

  def call(user_id) do
    result = success(user_id)
            ~>> fn user_id -> find_user(user_id) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def find_user(user_id) do
    case Site.Repo.get(User, user_id) do
      nil ->
        error(ErrCodes.record_not_found)
      user ->
        success(user)
    end
  end
end
