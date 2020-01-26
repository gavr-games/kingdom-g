# Game Management Queue

Name: `game.management`

## Messages

### Create game

Site will send this message when the game is started
```json
{
  action: "create_game",
  data: {
    "has_password":false,
    "id":14,
    "mode_id":null,
    "owner":{
        "username":"321"
    },
    "owner_id":4,
    "players":[
        {
          "game_id":14,
          "id":29,
          "is_observer":false,
          "team":0,
          "user_id":4,
          "username":"321"
        },
        {
          "game_id":14,
          "id":30,
          "is_observer":false,
          "team":1,
          "user_id":3,
          "username":"123"
        }
    ],
    "status":"started",
    "time_limit":0,
    "title":"3"
  }
```