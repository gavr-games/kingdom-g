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
| base | For not logged in users to perform login and signup |
| user | For logged in users to perform edit profile and check location |

### Base

This channel is for not logged in users to perform login and signup.

#### Signup

To signup you should send message with type `msg` and payload:
```json
{
  action: "signup",
  data: {
    username: "king1",
    password: "12345678",
    email: "king1@kingdom-g.gavr.games"
  }
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "signup",
  data: {
    token: "12345token"
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "signup",
  code: 1 //See the list of error codes in the end of the doc
}
```

### User

This channel is for not logged in users to perform login and signup.

#### Check Location

Send message with type `msg` and payload:
```json
{
  action: "check_location",
  data: {}
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "check_location",
  data: {
    location: "arena" // possible values are: arena, game
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "check_location",
  code: 1 //See the list of error codes in the end of the doc
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 1    | Internal Server Error |
| 1001 | Required fields are blank |
| 1002 | Email is already taken |