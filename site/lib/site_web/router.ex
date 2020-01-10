defmodule SiteWeb.Router do
  use SiteWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", SiteWeb do
    pipe_through :api
  end
end
