defmodule Site.ErrorCodes do
  use Site.Constants

  define server_error, 1
  define empty_fields, 1001
  define email_taken, 1002
end
