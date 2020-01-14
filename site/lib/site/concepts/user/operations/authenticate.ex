defmodule Site.User.Operations.Authenticate do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.User

  def call(%{"email" => email, "password" => password}) do
    result = success(email)
             ~>> fn email -> user_exists(email) end
             ~>> fn user -> validate_password(user, password) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def user_exists(email) do
    case Site.Repo.get_by(User, email: email) do
      nil  -> error(ErrCodes.invalid_email_or_password)
      user -> success(user)
    end
  end

  def validate_password(user, password) do
    case Comeonin.Argon2.checkpw(password, user.password) do
      false  -> error(ErrCodes.invalid_email_or_password)
      true   -> success(user)
    end
  end
end