# Arena Channel

This channel is for logged in users to create/join/start games and etc.

## Commands from user

### List games

### Get my games

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

### Start game

### Exit game

## Commands from server

### Add game

### Add player to game

### Change game status

### Remove game
