defmodule Site.User.Operations.VerifyToken do
  def call(token) do
    Phoenix.Token.verify(SiteWeb.Endpoint, "user salt", token, max_age: 86400)
  end
end
