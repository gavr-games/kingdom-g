defmodule Site.Game.Operations.Exit do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  import Ecto.Query, only: [from: 2]
  alias Site.{User, Game, Repo, Player}
  alias Site.User.Operations.GetCurrentGame

  def call(%{"game_id" => game_id}, user_id) do
    result = success(user_id)
            ~>> fn user_id -> check_user_in_game(user_id, game_id) end
            ~>> fn game -> check_game_is_not_started(game) end
            ~>> fn game -> remove_player(game, user_id) end
            ~>> fn game -> check_last_player(game) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def check_user_in_game(user_id, game_id) do
    case GetCurrentGame.call(user_id) do
      nil ->
        error(ErrCodes.user_not_in_game)
      game ->
        if game.id == game_id do
          success(game)
        else
          error(ErrCodes.user_not_in_game)
        end
    end
  end

  def check_game_is_not_started(game) do
    case game.status do
      "started" ->
        error(ErrCodes.game_is_already_started)
      _ ->
        success(game)
    end
  end

  def remove_player(game, user_id) do
    from(p in Player, where: p.user_id == ^user_id and p.game_id == ^game.id)
      |> Repo.delete_all
    success(game)
  end

  def check_last_player(game) do
    case game.status do
      "waiting" ->
        query = from(p in Player, where: p.game_id == ^game.id)
        case Repo.exists?(query) do
          true ->
            success(game)
          false ->
            case Repo.delete game do
              {:ok, game} ->
                success(Map.put(game, :status, "deleted")) 
              {:error, _changeset} ->
                error(ErrCodes.server_error)
            end
        end
      _ ->
        success(game)
    end
  end
end
