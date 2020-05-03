defmodule SiteWeb.UserChannel do
  use Phoenix.Channel
  alias Site.Commands.User.Process
  require Logger

  def join("user:" <> user_id, _params, socket) do
    case socket.assigns.user_id == String.to_integer(user_id) do
      true ->
        Logger.info Logger.info "User joined user:#{user_id}"
        {:ok, socket}
      false ->
        {:error, %{reason: "unauthorized"}}
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