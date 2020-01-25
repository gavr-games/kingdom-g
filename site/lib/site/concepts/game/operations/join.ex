defmodule Site.Game.Operations.Join do
  require Site.ErrorCodes
  alias Site.ErrorCodes, as: ErrCodes
  use Monad.Operators
  import Monad.Result
  alias Site.{User, Game, Repo, Player}
  alias Site.User.Operations.GetCurrentGame

  def call(%{"game_id" => game_id}, user_id) do
    result = success(user_id)
            ~>> fn user_id -> check_user_in_game(user_id) end
            ~>> fn user_id -> check_game_exists(game_id) end
            ~>> fn game -> check_game_finished(game) end
            ~>> fn game -> add_player(game, user_id) end

    if success?(result) do
      success(unwrap!(result))
    else
      error(result.error)
    end
  end

  def check_game_exists(game_id) do
    case Site.Repo.get(Game, game_id) do
      nil ->
        error(ErrCodes.record_not_found)
      game ->
        success(game)
    end
  end

  def check_game_finished(game) do
    case game.status do
      "finished" ->
        error(ErrCodes.game_is_already_finished)
      _ ->
        success(game)
    end
  end

  def check_user_in_game(user_id) do
    case GetCurrentGame.call(user_id) do
      nil ->
        success(user_id)
      game ->
        error(ErrCodes.user_already_in_game)
    end
  end

  def add_player(game, user_id) do
    player_params = %{game_id: game.id, user_id: user_id}
    changeset = Player.changeset(%Player{}, player_params)

    case Site.Repo.insert(changeset) do
      {:ok, player} ->
        success(game)
      {:error, changeset} ->
        code = ErrCodes.server_error
        fields_blank = Enum.any?(changeset.errors, fn (err) -> elem(elem(err, 1), 0) == "can't be blank" end)
        code = if fields_blank do
          ErrCodes.empty_fields
        else
          code
        end
        error(code)
    end
  end
end
