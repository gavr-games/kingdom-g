defmodule Site.Rabbitmq.GameReplies do
  use GenServer
  use AMQP
  require Logger

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: :game_replies)
  end

  @exchange    "game.replies"
  @queue       "site.game.replies"

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
        {:ok, _} = Queue.declare(channel, @queue, durable: true)
        :ok = Queue.bind(channel, @queue, @exchange, routing_key: "game_state")
        :ok = Queue.bind(channel, @queue, @exchange, routing_key: "commands")
        :ok = Queue.bind(channel, @queue, @exchange, routing_key: "error")
        # Limit unacknowledged messages to 10
        :ok = Basic.qos(channel, prefetch_count: 10)
        # Register the GenServer process as a consumer
        {:ok, _consumer_tag} = Basic.consume(channel, @queue)
        {:noreply, %{channel: channel, connection: conn}}
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

  # Confirmation sent by the broker after registering this process as a consumer
  def handle_info({:basic_consume_ok, %{consumer_tag: consumer_tag}}, state) do
    {:noreply, state}
  end

  # Sent by the broker when the consumer is unexpectedly cancelled (such as after a queue deletion)
  def handle_info({:basic_cancel, %{consumer_tag: consumer_tag}}, state) do
    {:stop, :normal, state}
  end

  # Confirmation sent by the broker to the consumer process after a Basic.cancel
  def handle_info({:basic_cancel_ok, %{consumer_tag: consumer_tag}}, state) do
    {:noreply, state}
  end

  def handle_info({:basic_deliver, payload, %{delivery_tag: tag, routing_key: routing_key}}, state) do
    # You might want to run payload consumption in separate Tasks in production
    consume(state, tag, routing_key, payload)
    {:noreply, state}
  end

  defp consume(%{channel: channel, connection: conn}, tag, routing_key, payload) do
    :ok = Basic.ack channel, tag
    payload = Jason.decode!(payload)
    case routing_key do
      "game_state" ->
        Site.Replies.GameState.Process.call(payload)
      "commands" ->
        Site.Replies.Commands.Process.call(payload)
      "error" ->
        Site.Replies.Error.Process.call(payload)
    end
  end

  def terminate(_reason, state) do
    Connection.close(state.connection)
  end
end
