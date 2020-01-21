
# User Channel

This channel is for logged in users to perform profile edit and check location.

## Check Location

Send message with type `msg` and payload:
```json
{
  action: "check_location",
  data: {}
}
```

In case of success a `msg` message will be sent back with the next payload:
```json
{
  action: "check_location",
  data: {
    location: "arena" // possible values are: 'arena', 'game'. 'game' is returned, when user is in started game
  }
}
```

In case of error a `error` message will be sent back with the next payload:
```json
{
  action: "check_location",
  code: 1 //See the list of error codes in the end of the doc
}
```