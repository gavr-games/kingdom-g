defmodule Site.Rabbitmq.GameManagementSupervisor do
  use Supervisor

  def start_link(_) do
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    children = [
      Site.Rabbitmq.GameManagement
    ]

    Supervisor.init(children, strategy: :one_for_one, max_restarts: 100, max_seconds: 5)
  end
end
