defmodule SiteWeb.GameChannel do
  use Phoenix.Channel
  alias Site.Commands.Game.{Process, PerformAction}
  alias Site.User.Operations.GetCurrentGame
  require Logger

  def join("game:"  <> game_id, _params, socket) do
    Logger.info "User tries to join game channel game:#{game_id}"
    case GetCurrentGame.call(socket.assigns.user_id) do
      nil ->
        {:error, %{reason: "unauthorized"}}
      game ->
        case game.id == String.to_integer(game_id) do
          true ->
            PerformAction.call(%{"action" => "get-game-data", "parameters" => %{}}, socket.assigns.user_id)
            Logger.info "User joined game channel game:#{game_id}"
            {:ok, socket}
          false ->
            {:error, %{reason: "unauthorized"}}
        end
    end
  end

  def handle_in("msg", params, socket) do
    answer_type = "msg"
    answer_data = %{}
    {answer_type, answer_data} = case Process.call(params, socket.assigns.user_id) do
      {:ok, answer} ->
        {"msg", answer}
      {:error, err} ->
        {"error", err}
    end
    answer_data = Map.put(answer_data, :action, params["action"])
    push socket, answer_type, answer_data
    {:noreply, socket}
  end
end