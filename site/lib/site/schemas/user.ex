defmodule Site.User do
  use Ecto.Schema
  import Ecto.Changeset


  schema "users" do
    field :username, :string
    field :email, :string
    field :password, :string
    has_many :players, Site.Player

    timestamps()
  end

  @doc false
  def changeset(user, attrs \\ %{}) do
    user
    |> cast(attrs, [:username, :email, :password])
    |> unique_constraint(:email)
    |> validate_required([:username, :email, :password])
  end
end