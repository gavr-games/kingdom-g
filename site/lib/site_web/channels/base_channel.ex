defmodule SiteWeb.BaseChannel do
  use Phoenix.Channel
  alias Site.Commands.Base.Process
  require Logger

  def join("base", _params, socket) do
    Logger.info "User joined base channel"
    {:ok, socket}
  end

  def handle_in("msg", params, socket) do
    answer_type = "msg"
    answer_data = %{}
    {answer_type, answer_data} = case Process.call(params) do
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