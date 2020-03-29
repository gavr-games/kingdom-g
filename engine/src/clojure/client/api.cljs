(ns client.api
  (:require [engine.command-runner :as cr]
            [cljs.reader]))

(def game (atom {}))

(defn ^:export init-game
  "Initialises a local game from `game-edn` string."
  [game-edn]
  (reset! game (cljs.reader/read-string game-edn)))

(defn ^:export apply-command
  "Applies the given command to the local game."
  [command-js]
  (let [cmd (js->clj command-js :keywordize-keys true)
        cmd (assoc cmd :command (keyword (:command cmd)))]
    (swap! game cr/apply-command cmd)))


(defn clean-object
  "Removes irrelevant information for the client from the given object."
  [obj]
  (dissoc obj :handlers))

(defn clean-objects
  "Cleans `objs` as a map from object id to object data."
  [objs]
  (reduce-kv #(assoc %1 %2 (clean-object %3)) {} objs))

(defn ^:export get-objects
  "Returns a map of object IDs to objects."
  []
  (let [objects (:objects @game)]
    (clj->js (clean-objects objects))))

(defn ^:export get-object
  [obj-id]
  (let [obj (get-in @game [:objects obj-id])]
    (clj->js (clean-object obj))))

(defn ^:export get-all-coords
  "Returns an array of all valid coordinates."
  []
  (let [coords (sort (keys (:board @game)))]
    (clj->js coords)))

