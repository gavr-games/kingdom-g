defmodule Site.User.Operations.GenerateToken do
  def call(user) do
    Phoenix.Token.sign(SiteWeb.Endpoint, "user salt", user.id)
  end
end
