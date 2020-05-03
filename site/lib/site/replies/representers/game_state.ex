defmodule Site.Replies.Representers.GameState do
  def call(game_state) do
    %{
      action: "game_state",
      data: %{
        game_state: game_state
      }
    }
  end
end
