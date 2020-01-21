FROM elixir:1.9.4

RUN mix local.hex --force
RUN mix archive.install --force hex phx_new 1.4.11
RUN mix local.rebar --force

WORKDIR /app
COPY . .

EXPOSE 4000

# Initial setup
RUN mix deps.get
