defmodule Site.Commands.Arena.Representers.AddGameRepresenter do
  alias Site.Commands.Arena.Representers.{GameRepresenter}

  def call(game) do
    %{
      action: "command",
      data: %{
        command: "add_game",
        params: GameRepresenter.call(game)
      }
    }
  end
end
