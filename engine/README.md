# Game Engine

This is the game engine server that gets game actions from RabbitMq and sends updates back.

## Running with lein (development)

To start the server with lein, run:

    lein run

## Building and running for production:

    lein uberjar

This will create a standalone jar with all the dependencies inside, which can then be run with

    java -jar ./target/uberjar/engine-0.1.0-SNAPSHOT-standalone.jar


## Running tests

To run clojure (server) tests

    lein test


## Javascript engine library

To compile library and put it into resources/engine.js

    lein with-profile js-library cljsbuild once compile

To run js engine library tests (same tests, just compiled to js)

    lein with-profile js-library doo once

This will use nashorn js environment (included by default with jdk)

