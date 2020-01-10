#!/usr/bin/env bash

mix deps.get
mix ecto.migrate
mix phx.server