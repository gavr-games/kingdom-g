defmodule SiteWeb.UserChannel do
  use Phoenix.Channel
  require Logger

  def join("base", _params, socket) do
    Logger.info "User joined base channel"
    {:ok, socket}
  end
end