defmodule Site.Player do
  use Ecto.Schema
  import Ecto.Changeset

  schema "players" do
    belongs_to :user, Site.User
    belongs_to :game, Site.Game

    timestamps()
  end

  @doc false
  def changeset(player, attrs \\ %{}) do
    player
    |> cast(attrs, [:user_id, :game_id])
    |> validate_required([:user_id, :game_id])
  end
end