defmodule SiteWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  ## Channels
  # channel "room:*", SiteWeb.RoomChannel

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  
  channel "base", SiteWeb.BaseChannel
  channel "user", SiteWeb.UserChannel

  def connect(params = %{"token" => token}, socket) do
    Logger.info "New socket with token " <> token
    result = Site.User.Operations.VerifyToken.call(token)
    case result do
      {:ok, user_id} ->
        socket = socket 
          |> assign(:token, params["token"])
          |> assign(:user_id, user_id)
        {:ok, socket}
      _ ->
        :error
    end
  end

  def connect(%{}, socket) do
    Logger.info "New anonymous socket"
    {:ok, socket}
  end

  def socket_id(socket) do
    if Map.has_key?(socket.assigns, :user_id) do
      "users_socket:#{socket.assigns.user_id}"
    else
      nil
    end
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     SiteWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(socket), do: socket_id(socket)
end
