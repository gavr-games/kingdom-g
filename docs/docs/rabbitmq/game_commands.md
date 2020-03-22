# Game Commands Exchange

Name: `game.commands.X`, where X is game ID, e.g. `game.commands.5` for game 5.
Type: direct.

Game Engine will send all new commands and replies to player messages to this exchange.
For new commands the routing key is `commands`, and for replies (error reply and game state reply) the routing key is `reply`.

## Messages

### Commands

Engine will send a following message on a successfully performed game engine
```json
{
    "success":true,
    "commands":
    [
        {"command":"set-moves","object-id":1,"moves":0},
        {"command":"attack","attacker":1,"target":0,"params":{"damage":2,"outcome":"critical","type":"melee"}},
        {"command":"set-health","object-id":0,"health":8},
        {"command":"set-experience","object-id":1,"experience":2}
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

Game state will be sent as an edn string (clojure data format).
