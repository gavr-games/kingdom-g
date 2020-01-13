defmodule Site.User.Operations.Create do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.User

  def call(user_params) do
    result = success(user_params)
            ~>> fn user_params -> encrypt_password_param(user_params) end
            ~>> fn updated_params -> create(updated_params) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def create(user_params) do
    changeset = User.changeset(%User{}, user_params)

    case Site.Repo.insert(changeset) do
      {:ok, user} ->
        success(user)
      {:error, changeset} ->
        code = ErrCodes.server_error
        fields_blank = Enum.any?(changeset.errors, fn (err) -> elem(elem(err, 1), 0) == "can't be blank" end)
        email_taken = Enum.any?(changeset.errors, fn (err) -> elem(elem(err, 1), 0) == "has already been taken" end)
        code = if fields_blank do
          ErrCodes.empty_fields
        else
          code
        end
        code = if email_taken do
          ErrCodes.email_taken
        else
          code
        end
        error(code)
    end
  end

  def encrypt_password_param(user_params) do
    case user_params["password"] do
      "" -> success(user_params)
      pass -> success(Map.put(user_params, "password", Comeonin.Argon2.hashpwsalt(pass)))
    end
  end
end
