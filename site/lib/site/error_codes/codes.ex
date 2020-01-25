defmodule Site.ErrorCodes do
  use Site.Constants

  define server_error, 1
  define record_not_found, 2
  define empty_fields, 1001
  define email_taken, 1002
  define invalid_email_or_password, 1003
  define user_already_in_game, 1101
  define game_is_already_finished, 1102
  define user_not_in_game, 1103
  define game_is_already_started, 1104
end
