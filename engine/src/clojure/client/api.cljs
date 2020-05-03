(ns client.api
  (:require [engine.core :as core]
            [engine.command-runner :as cr]
            [engine.pathfinding :as pf]
            [engine.attack :as attack]
            [engine.newgame :as ng]
            [engine.checks :as check]
            [cljs.reader]))

(def game (atom {}))

(defn ^:export init-test-game
  []
  (reset! game (ng/create-test-game)))

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

(defn ^:export find-path
  [obj-id coord-js]
  (clj->js
   (pf/find-path @game obj-id (js->clj coord-js))))

(defn ^:export attack-outcomes
  [obj-id target-id]
  (let [obj (get-in @game [:objects obj-id])
        target (get-in @game [:objects target-id])]
    (clj->js
     (attack/get-attack-possibilities obj target))))

(defn ^:export shoot-outcomes
  [obj-id target-id]
  (let [obj (get-in @game [:objects obj-id])
        target (get-in @game [:objects target-id])
        d (core/obj-distance obj target)]
    (clj->js
     (attack/get-shot-possibilities obj target d))))

(defn ^:export can-levelup
  [obj-id]
  (nil? (check/can-levelup @game obj-id)))
