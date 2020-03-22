(ns client.api
  (:require [engine.actions :as a]
            [engine.abilities]
            [cljs.reader]))

(def game (atom {}))

(defn ^:export init-game
  "Initialises a local game from `game-edn` string."
  [game-edn]
  (reset! game (cljs.reader/read-string game-edn)))

(defn ^:export apply-command
  "Applies the given command to the local game."
  [command]
  (println "TODO: Apply command."))


(defn clean-object
  "Removes irrelevant information for the client from the given object."
  [obj]
  (dissoc obj :handlers))

(defn clean-objects
  "Cleans `objs` as a map from object id to object data."
  [objs]
  (reduce-kv #(assoc %1 %2 (clean-object %3)) {} objs))

(defn ^:export get-objects
  []
  (let [objects (:objects @game)]
    (clj->js (clean-objects objects))))

(defn ^:export get-all-coords
  "Returns an array of all valid coortinates."
  []
  (let [coords (sort (keys (:board @game)))]
    (clj->js coords)))

