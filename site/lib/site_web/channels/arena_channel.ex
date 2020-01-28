defmodule SiteWeb.ArenaChannel do
  use Phoenix.Channel
  alias Site.Commands.Arena.Process
  alias Site.Presence
  alias Site.User
  require Logger

  def join("arena", _params, socket) do
    Logger.info "User joined arena channel"
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))
    user = Site.Repo.get(User, socket.assigns.user_id)
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      user_id: user.id,
      username: user.username,
      online_at: inspect(System.system_time(:second))
    })
    {:noreply, socket}
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