defmodule Site.Game.Operations.Start do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.{User, Game, Repo, Player}
  alias Site.User.Operations.GetCurrentGame

  def call(%{"game_id" => game_id}, user_id) do
    result = success(user_id)
            ~>> fn user_id -> check_game_exists(game_id) end
            ~>> fn game -> check_user_is_owner(game, user_id) end
            ~>> fn game -> check_game_status(game) end
            ~>> fn game -> change_game_status(game) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def check_game_exists(game_id) do
    case Repo.get(Game, game_id) do
      nil ->
        error(ErrCodes.record_not_found)
      game ->
        game = Repo.preload game, [:owner, players: :user]
        success(game)
    end
  end

  def check_user_is_owner(game, user_id) do
    if game.owner_id == user_id do
        success(game)
    else
        error(ErrCodes.only_owner_can_start_the_game)
    end
  end

  def check_game_status(game) do
    case game.status do
      "waiting" ->
        success(game)
      _ ->
        error(ErrCodes.game_is_already_started)
    end
  end

  def change_game_status(game) do
    game = Ecto.Changeset.change game, status: "started"

    case Repo.update(game) do
      {:ok, game} ->
        success(game)
      {:error, changeset} ->
        code = ErrCodes.server_error
        error(code)
    end
  end
end
