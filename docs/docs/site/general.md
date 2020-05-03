# Site Docs

Communication with Site is performed via web sockets handled via [Phoenix Framework](https://hexdocs.pm/phoenix/channels.html#content).

## Endpoint

`wss:<DOMAIN_NAME>/socket`

## Authentication

Authentication is performed via `token`, which you need to send during web socket connection stage.
You can get `token` after Login or Signup.

## Channels

| Name | Description |
|------|-------------|
| arena | For logged in users to perform create/join/start game and etc |
| base | For not logged in users to perform login and signup |
| game:game_id | For logged in users to perform all game related actions |
| user:user_id | For logged in users to perform edit profile and check location |

