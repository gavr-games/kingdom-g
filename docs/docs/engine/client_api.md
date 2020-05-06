# Engine JS Library

Engine code is compiled to a javascript library to provide a client API for game objects and actions.

## Methods

### `client.api.init_game(game_edn)`

Initialises the game from the string with edn game state.

### `client.api.init_test_game()`

Initialises a test game with two players (for debugging).

### `client.api.get_game_data()`

Returns all game data as js object (for debugging).

### `client.api.get_all_coords()`

Returns an array with all coordinates on the board, where every coordinate is an array of two integers, e.g.

`[[0, 0], [0, 1], ..., [19, 19]]`

### `client.api.get_objects()`

Returns a dictionary of all objects in the game, such as

```js
{
    "0": {  // Keys are object IDs
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
        "type": "castle",
        "max-health": 10,
        "class": "building",
        "health": 10,
        "position": [0, 0],
        "player": 0
    },
    "1": {
        "moves": 2,
        "coords": {
            "[0 0]": {
                "fill": "unit"
            }
        },
        "max-moves": 2,
        "type": "spearman",
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
}
```

### `client.api.get_object(object-id)`

Returns object data for the given object id.


### `client.api.apply-command(command)`

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

### `client.api.can_levelup(object_id)`

Checks if object can levelup.

### `client.api.get_players()`

Returns an array of player id's in the order of their turns.

### `client.api.get_player(player_id)`

Returns player data as a js object.

### `client.api.get_active_player()`

Returns the id of the currently active player.
