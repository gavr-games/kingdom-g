# Base Channel

This channel is for not logged in users to perform login and signup.

## Login

To login you should send message with type `msg` and payload:
```json
{
  action: "login",
  data: {
    password: "12345678",
    email: "king1@kingdom-g.gavr.games"
  }
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "login",
  data: {
    id: 123,
    token: "12345token"
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "login",
  code: 1 //See the list of error codes in the end of the doc
}
```

## Signup

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
    id: 123,
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