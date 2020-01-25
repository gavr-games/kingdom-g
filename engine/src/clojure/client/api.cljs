(ns client.api
  (:require [engine.actions :as a]
            [engine.abilities]))

(def game (atom {}))

;; Public API

(defn ^:export init-game
  "Initialises a local game from the state passed with the json object."
  [game-json]
  (println "TODO: Initialise the game.")
  (reset! game (js->clj game-json)))

(defn ^:export apply-command
  "Applies the given command to the local game."
  [command]
  (println "TODO: Apply command."))
