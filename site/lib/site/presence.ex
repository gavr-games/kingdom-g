defmodule Site.Presence do
  use Phoenix.Presence, otp_app: :site,
                        pubsub_server: Site.PubSub
end