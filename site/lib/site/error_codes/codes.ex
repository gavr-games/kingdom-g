defmodule Site.ErrorCodes do
  use Site.Constants

  define server_error, 1
  define empty_fields, 1001
  define email_taken, 1002
  define invalid_email_or_password, 1003
  define user_already_in_game, 1101
end
