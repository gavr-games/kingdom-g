defmodule Site.Replies.Error.Process do
  alias Site.{Repo, Player}
  require Logger

  def call(payload) do
    Logger.info "Received errors payload: #{inspect(payload)}"
    case Repo.get(Player, payload["player"]) do
      nil ->
        Logger.error "Cannot find player #{payload["player"]} for GameState reply"
      player ->
        SiteWeb.Endpoint.broadcast "user:#{player.user_id}", "error", %{error: payload["error"]}
    end
  end
end
