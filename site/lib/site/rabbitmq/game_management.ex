defmodule Site.Rabbitmq.GameManagement do
  use GenServer
  alias AMQP.Connection
  require Logger

  @reconnect_interval 5_000

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: :game_management)
  end

  def publish(message) do
    GenServer.cast(:game_management, {:publish, message})
  end

  def init(_) do
    Logger.info "--> Init management"
    send(self(), :connect)
    {:ok, nil}
  end

  def handle_info(:connect, _state) do
    case Connection.open(System.get_env("RABBITMQ_URL")) do
      {:ok, conn} ->
        # Get notifications when the connection goes down
        Process.monitor(conn.pid)
        {:ok, channel} = AMQP.Channel.open(conn)
        {:noreply, %{channel: channel, connection: conn} }
      {:error, _} ->
        Logger.error("Failed to connect #{System.get_env("RABBITMQ_URL")}. Reconnecting later...")
        # Retry later
        Process.send_after(self(), :connect, @reconnect_interval)
        {:noreply, nil}
    end
  end

  def handle_info({:DOWN, _, :process, _pid, reason}, _) do
    # Stop GenServer. Will be restarted by Supervisor.
    {:stop, {:connection_lost, reason}, nil}
  end

  def handle_cast({:publish, message}, state) do
    Logger.info "--> Publishing message"
    AMQP.Basic.publish(state.channel, "", "game.management", message)
    {:noreply, state}
  end

  def terminate(_reason, state) do
    if state != nil do
      AMQP.Connection.close(state.connection)
    end
  end
end
