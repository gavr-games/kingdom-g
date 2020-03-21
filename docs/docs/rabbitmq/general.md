# RabbitMQ

## Queues and exchanges

| Name | Description |
|------|-------------|
| game.management | To create and manage games |
| game.actions.X | For sending player actions for game X into the game engine |
| game.commands.X | Exchange into which game engine writes new commands with routing key “command” and replies to players (error action reply, game state reply) with routing key “reply”. |
