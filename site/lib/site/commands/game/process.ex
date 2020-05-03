defmodule Site.Commands.Game.Process do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  import Monad.Result

  def call(%{"action" => action, "data" => data}, user_id) do
  end
end
