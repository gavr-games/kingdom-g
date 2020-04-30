# Game Replies Exchange

Name: `game.replies`.
Type: direct.

Game Engine will send all new commands and replies to player messages to this exchange for all games.
For new commands the routing key is `commands`, for game state replies routing key is `game_state`, for error messages after invalid actions routing key is `error`.

All messages have fields `game_id`, `player` and `reply_type` (can be `commands`, `game_state` or `error`). Additional fields specific to the reply type are described below.

## Reply types

### Commands

Engine will send a following message on a successfully performed game action
```json
{
    "success":true,
    "commands":
    [
        {"command":"set-moves","object_id":1,"moves":0},
        {"command":"attack","attacker":1,"target":0,"params":{"damage":2,"outcome":"critical","type":"melee"}},
        {"command":"set-health","object_id":0,"health":8},
        {"command":"set-experience","object_id":1,"experience":2}
    ]
}
```

TODO: How to specify command visibility? Inside the commands?

### Error replies

On error action Engine will send a following reply with a corresponding error code:

```json
{
    "success":false,
    "error":"target-object-is-not-reachable"
}
```

### Game state reply

```js
{
    "game_state":"..."  // Game state is sent as an edn string (clojure data format)
}
```

