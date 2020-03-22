# Game Actions Queue

Name: `game.actions.X`, where X is game ID, e.g. `game.actions.5` for game 5.

This is the queue for all player queries and game actions. Reply to these messages would normally be sent to the exchange `game.commands.X` unless `reply_to` queue is specified. Replies will have the same `correlation_id` as the requests.

## Messages

### Getting game state

Request for getting game state for a certain player:

```json
{
    "action": "get-game-data",
    "parameters": {
        "p":55
    }
}
```

### Player actions

On player actions Site will send messages such as

```js
{
    "action": "move",
    "parameters": {
        "p":55,  // Player ID of a player that is performing the action
        "obj-id":14,  // ID of the object (unit) to move
        "new-position":[3,10]  // new x and y coordinates
    }
}
```

```js
{
    "action": "attack",
    "parameters": {
        "p":55,
        "obj-id":14,
        "target-id":15  // Object ID of the attack target
    }
}
```
