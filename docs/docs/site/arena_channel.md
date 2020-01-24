# Arena Channel

This channel is for logged in users to create/join/start games and etc.

## Commands from user

### Get games list

To list all active games (not finished) you should send message with type `msg` and payload:
```json
{
  action: "get_games",
  data: {}
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "get_games",
  data: [
    {
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
  ]
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "get_games",
  code: 1101 //See the list of error codes in the end of the doc
}
```

### Create game

To create game you should send message with type `msg` and payload:
```json
{
  action: "create_game",
  data: {
    title: "My Game",
    password: "12345678",
    mode_id: 1,
    time_limit: 60 // in seconds
  }
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "create_game",
  data: {
    id: 123
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "create_game",
  code: 1101 //See the list of error codes in the end of the doc
}
```

### Join game

To join game you should send message with type `msg` and payload:
```json
{
  action: "join_game",
  data: {
    game_id: 123
  }
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "join_game",
  data: {
    id: 123
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "join_game",
  code: 1102 //See the list of error codes in the end of the doc
}
```

### Start game

### Exit game


## Commands from server

### Add game

Received when a new game is created
```json
{
  action: "command",
  data: {
    command: "add_game",
    params: {
      has_password: false,
      id: 7,
      owner_id: 32,
      status: "waiting",
      time_limit: 60,
      title: "My Game"
    }
  }
}
```

### Add user to game
Received when a user joins game
```json
{
  action: "command",
  data: {
    command: "add_user_to_game",
    params: {
      game_id: 7,
      user_id: 32
    }
  }
}
```

### Change game status

### Remove game
