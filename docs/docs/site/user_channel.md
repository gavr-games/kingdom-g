
# User Channel

This channel is for logged in users to perform profile edit and check location.

## Check Location

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
    location: "arena" // possible values are: 'arena', 'game'. 'game' is returned, when user is in started game
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

## Get my profile

Send message with type `msg` and payload:
```json
{
  action: "get_my_profile",
  data: {}
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "get_my_profile",
  data: {
    id: 32,
    username: "Great Lord",
    email: "greatlord@kingdom-g.gavr.games"
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "get_my_profile",
  code: 1 //See the list of error codes in the end of the doc
}
```

## Get my game

Send message with type `msg` and payload:
```json
{
  action: "get_my_game",
  data: {}
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "get_my_game",
  data: {
    has_password: false,
    id: 10,
    mode_id: 1,
    owner: {
      username: "Lord 1"
    },
    owner_id: 32,
    status: "waiting",
    time_limit: 0,
    title: "My Game"
  }
}
```

In case user is not in game:
```json
{
  action: "get_my_game",
  data: {}
}
```
