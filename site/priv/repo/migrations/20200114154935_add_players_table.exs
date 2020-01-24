defmodule Site.Repo.Migrations.AddPlayersTable do
  use Ecto.Migration

  def change do
    create table(:players) do
      add :team, :integer
      add :is_observer, :boolean
      add :user_id, references(:users, on_delete: :delete_all)
      add :game_id, references(:games, on_delete: :delete_all)

      timestamps()
    end
  end
end
