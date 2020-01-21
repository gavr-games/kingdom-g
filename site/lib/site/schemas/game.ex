defmodule Site.Game do
  use Ecto.Schema
  import Ecto.Changeset

  schema "games" do
    field :title, :string
    field :password, :string
    field :status, :string
    field :mode_id, :integer
    field :time_limit, :integer
    has_many :players, Site.Player
    belongs_to :owner, Site.User

    timestamps()
  end

  @doc false
  def changeset(game, attrs \\ %{}) do
    game
    |> cast(attrs, [:title, :password, :status, :mode_id, :time_limit])
    |> validate_required([:title, :status])
  end
end