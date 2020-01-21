defmodule Site.Repo.Migrations.AddGamesTable do
  use Ecto.Migration

  def change do
    create table(:games) do
      add :title, :string
      add :status, :string
      add :mode_id, :integer
      add :password, :string
      add :time_limit, :integer
      add :owner_id, references(:users, on_delete: :delete_all)

      timestamps()
    end
  end
end
