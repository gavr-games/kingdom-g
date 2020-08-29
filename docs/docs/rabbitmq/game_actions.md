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

#### Move
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

#### Attack
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

#### Shoot
```js
{
    "action": "shoot",
    "parameters": {
        "p":55,
        "obj-id":14,
        "target-id":15  // Object ID of the attack target
    }
}
```

#### Bind
```js
{
    "action": "bind",
    "parameters": {
        "p":55,
        "obj-id":14,
        "target-id":15  // Object ID of the attack target
    }
}
```

#### Splash Attack
```js
{
    "action": "splash-attack",
    "parameters": {
        "p":55,
        "obj-id":14,
        "attack-position":[3,10] // x y coordinates of spash attack
    }
}
```

#### Levelup
```js
{
    "action": "levelup",
    "parameters": {
        "p":55,
        "obj-id":14,
        "stat":"attack" // "attack" "health" "moves"
    }
}
```
