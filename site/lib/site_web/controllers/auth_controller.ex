defmodule SiteWeb.AuthController do
  use SiteWeb, :controller

  def check(conn, %{"token" => token}) do
    result = Site.User.Operations.VerifyToken.call(token)
    case result do
      {:ok, user_id} ->
        json(conn, %{user_id: user_id})
      _ ->
        json(conn, %{user_id: nil})
    end
  end
end