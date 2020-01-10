# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :site,
  ecto_repos: [Site.Repo]

# Configures the endpoint
config :site, SiteWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "seuJrE2NeeeW0GMkw6F8f25Zrzp/pvwcN59oqVD9E3IFvuA8jqt43Vtgz7n/MdzA",
  render_errors: [view: SiteWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: Site.PubSub, adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

# Configure your database
config :site, Site.Repo,
  username: System.get_env("POSTGRES_USER"),
  password: System.get_env("POSTGRES_PASSWORD"),
  database: System.get_env("POSTGRES_DB"),
  hostname: System.get_env("POSTGRES_HOST"),
  pool_size: 10