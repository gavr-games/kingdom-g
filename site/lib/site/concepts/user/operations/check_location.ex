defmodule Site.User.Operations.CheckLocation do
  use Monad.Operators
  import Monad.Result
  alias Site.User.Operations.GetCurrentGame

  def call(user_id) do
    location = case GetCurrentGame.call(user_id) do
      nil -> "arena"
      game -> 
        if game.status == "started" do
          "game"
        else
          "arena"
        end
    end
    success(location)
  end
end
