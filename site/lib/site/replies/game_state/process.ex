defmodule Site.Replies.GameState.Process do
  alias Site.{Repo, Player}
  require Logger

  def call(payload) do
    Logger.info "Send game state to player:#{payload["player"]}"
    case Repo.get(Player, payload["player"]) do
      nil ->
        Logger.error "Cannot find player #{payload["player"]} for GameState reply"
      player ->
        SiteWeb.Endpoint.broadcast "user:#{player.user_id}", "msg", Site.Replies.Representers.GameState.call(payload["game_state"])
    end
  end
end
