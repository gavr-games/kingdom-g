defmodule Site.Replies.GameState.Process do
  require Logger

  def call(payload) do
    Logger.info "Send game state to user:#{payload["player"]}"
    SiteWeb.Endpoint.broadcast "user:#{payload["player"]}", "msg", Site.Replies.Representers.GameState.call(payload["game_state"])
  end
end
