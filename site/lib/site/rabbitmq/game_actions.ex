defmodule Site.Rabbitmq.GameActions do
  use GenServer
  alias AMQP.Connection
  require Logger

  @reconnect_interval 5_000

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: :game_actions)
  end

  def publish(game_id, message) do
    GenServer.cast(:game_actions, {:publish, game_id, message})
  end

  def init(_) do
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

  def handle_cast({:publish, game_id, message}, state) do
    Logger.info "--> Publishing game action to game.actions.#{game_id}"
    AMQP.Basic.publish(state.channel, "", "game.actions.#{game_id}", message)
    {:noreply, state}
  end

  def terminate(_reason, state) do
    if state != nil do
      AMQP.Connection.close(state.connection)
    end
  end
end
