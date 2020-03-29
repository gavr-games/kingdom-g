# Engine JS Library

Engine code is compiled to a javascript library to provide a client API for game objects and actions.

## Methods

### `client.api.init_game(game_edn)`

Initialises the game from the string with edn game state.

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
