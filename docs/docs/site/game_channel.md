# Game Channel

This channel is for users in game to perform game actions and receive replies.
Each game has individual channel with unique id equal to game id. Example: `game:1`.

## Join

Channel name should be `game:<GAME_ID>`
After join user will automatically get latest `game_state` via personal channel `user:<USER_ID>`.

```json
{
  action: "game_state",
  data: {
    game_state: "..." // edn string for `client.api.init_game(game_edn)` in clent_api
  }
}
```
