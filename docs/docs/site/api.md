# API

This is the doc for usual http API (not web sockets).
It is used in very rare cases, when web socket connection is not established.
Expects JSON payload and returns JSON payload.

# Check Auth

It is used to check the token is valid, because we cannot
say when web socket connection is dropped because token is not valid or internet connection error.

Endpoint: `/api/check_auth`
Payload: 
```json
{
  token: "some_token"
}
```
Response:
```json
{
  user_id: 1 // returns null if token is not valid
}
```
