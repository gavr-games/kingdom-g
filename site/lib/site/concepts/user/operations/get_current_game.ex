defmodule Site.User.Operations.GetCurrentGame do
  alias Site.{Repo, Game, User}
  import Ecto.Query, only: [from: 2]

  def call(user_id) do
    Repo.one from g in Game,
      join: p in assoc(g, :players),
      where: (g.status != "finished") and
             (p.user_id == ^user_id),
      preload: [:owner]
  end
end
