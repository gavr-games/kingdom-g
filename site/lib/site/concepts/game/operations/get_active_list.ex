defmodule Site.Game.Operations.GetActiveList do
  alias Site.{Game, Repo}
  import Ecto.Query, only: [from: 2]

  def call() do
    Repo.all from g in Game,
      where: (g.status != "finished"),
      preload: [:owner]
  end
end
