defmodule Site.Replies.Commands.Process do
  require Logger

  def call(payload) do
    Logger.info "Received commands payload: #{inspect(payload)}"
    SiteWeb.Endpoint.broadcast "game:#{payload["game_id"]}", "msg", payload
  end
end
