# Engine JS Library

Engine code is compiled to a javascript library to provide a client API for game objects and actions.

## Methods

### `client.api.init_game(game_edn)`

Initialises the game from the string with edn game state.

### `client.api.init_test_game()`

Initialises a test game with two players and some test objects (for testing purpose).

### `client.api.get_game_data()`

Returns all game data as js object (for testing purpose).

### `client.api.emulate_action(player, action, parameters)`

Emulates an action and returns its expected result. Does not change the internal game state.

```js
client.api.emulate_action(0, "move", {"obj-id":1, "new-position":[10, 10]})
> {"success": false, "error": "target_coord_not_reachable"}

client.api.emulate_action(0, "move", {"obj-id":1, "new-position":[1, 1]})
> {
    "success": true,
    "commands": [
        {
            "command": "set_moves",
            "object_id": 1,
            "moves": 1
        },
        {
            "command": "move_object",
            "object_id": 1,
            "position": [1, 1]
        }
    ]
}
```

### `client.api.get_all_coords()`

Returns an array with all coordinates on the board, where every coordinate is an array of two integers, e.g.

`[[0, 0], [0, 1], ..., [19, 19]]`

### `client.api.get_object_ids()`

Returns an array of object id's on the board.

### `client.api.get_object(object-id)`

Returns object data for the given object id.

Examples:

```js
{
    "type": "castle",
    "rotation": 0,
    "flip": 0,
    "coords": {
        "[0 0]": {
            "fill": "solid"
        },
        "[0 1]": {
            "fill": "solid"
        },
        "[1 0]": {
            "fill": "solid"
        },
        "[1 1]": {
            "fill": "floor",
            "spawn": true
        }
    },
    "max-health": 10,
    "class": "building",
    "health": 10,
    "position": [0, 0],
    "player": 0
}
```

```js
{
    "type": "spearman",
    "moves": 2,
    "coords": {
        "[0 0]": {
            "fill": "unit"
        }
    },
    "max-moves": 2,
    "max-health": 1,
    "actions": [
        "move",
        "levelup",
        "attack"
    ],
    "class": "unit",
    "health": 1,
    "position": [2, 0],
    "player": 0,
    "attack": 1
}
```

### `client.api.apply_command(command)`

Applies a server command to the local game state. Command should be passed as a javascript dictionary, such as

`{ command: "set-health", "object-id": 0, health: 8 }`

### `client.api.find_path(object_id, destination)`

Finds a path for the object to the destination.
Destination should be an array of two integers.
Path is returned as an array of coordinates with destination being the last one.
The object should have enough moves to reach the destination.
Destination coordinate can be occupied. If it is occupied, looks for a path with the last step stepping on the destination.
Returns null if path doesn't exist.

For flying objects if the destination is further than one step away, but occupied, returns null. If the destination is free and within reach, returns a path consisting only of destination.

Example:
```js
client.api.get_object(1).position
> [2, 0]

client.api.find_path(1, [2, 2])
> [[2, 1], [2, 2]]

client.api.find_path(1, [2, 3])
> null  // not enough moves
```

### `client.api.can_be_placed_at(object_id, position)`

Checks if an object can be moved to the given position (preserving flip and rotation).

```js
client.api.can_be_placed_at(1, [1, 1])
> true
```

### `client.api.can_be_safely_placed_at(object_id, position)`

Same as `client.api.can_be_placed_at`, but additionally checks that the object wouldn't drown.

### `client.api.attack_outcomes(object_id, target_id)`

Returns an array of possible outcomes if the object would attack the target.
Preconditions: object has "attack" action, target has health attribute.

Does not check if object has enough moves or is near the target.

Outcomes are returned in the following format:
```js
[
    { weight: 5, damage: 1, outcome: "hit" },
    { weight: 1, damage: 2, outcome: "critical" }
]
```

Weight indicates how likely is this result.
Outcome attribute can be "hit", "critical", "miss" (for UI purposes).


### `client.api.shoot_outcomes(object_id, target_id)`

Returns an array of possible outcomes if the object would shoot the target.
Preconditions: object has "shoot" action, target has health attribute.

Takes into account the distance between objects.
Outcomes are returned in the same way as `attack_outcomes`.

If target is too far or too close, returns null, if the object cannot shoot this target, returns empty array.

### `client.api.get_default_shoot_parameters(object_id)`

Returns an object with the default shoot outcomes depending on the distance. For non-shooting objects throws an error.

Example:
```json
{
    "2": [
        {
            "weight": 1,
            "damage": 2,
            "outcome": "hit"
        }
    ],
    "3": [
        {
            "weight": 1,
            "damage": 2,
            "outcome": "hit"
        },
        {
            "weight": 1,
            "damage": 1,
            "outcome": "hit"
        }
    ],
    "4": [
        {
            "weight": 1,
            "damage": 1,
            "outcome": "hit"
        },
        {
            "weight": 1,
            "outcome": "miss"
        }
    ]
}
```

### `client.api.can_levelup(object_id)`

Checks if object can levelup.

### `client.api.get_player_ids()`

Returns an array of player id's in the order of their turns.

### `client.api.get_player(player_id)`

Returns player data as a js object.

### `client.api.get_active_players()`

Returns an array with id's of the currently active players.
