(ns client.api
  (:require [engine.core :as core]
            [engine.command-runner :as cr]
            [engine.pathfinding :as pf]
            [engine.attack :as attack]
            [engine.newgame :as ng]
            [engine.checks :as check]
            [cljs.reader]
            [clojure.string :as string]))

(def game (atom {}))

(defn- underscorify
  "Turns kw into string and replaces minuses with underscores."
  [kw]
  (string/replace (name kw) \- \_))

(defn- clj->jsu
  [x]
  (clj->js x :keyword-fn underscorify))

(defn ^:export init-test-game
  []
  (reset! game (-> (ng/create-test-game)
                   (ng/add-test-objects))))

(defn ^:export get-game-data
  []
  (clj->jsu @game))

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

(defn ^:export get-object-ids
  "Returns a map of object IDs to objects."
  []
  (clj->jsu (keys (:objects @game))))

(defn ^:export get-object
  [obj-id]
  (let [obj (get-in @game [:objects obj-id])]
    (clj->jsu (clean-object obj))))

(defn ^:export get-all-coords
  "Returns an array of all valid coordinates."
  []
  (let [coords (sort (keys (:board @game)))]
    (clj->jsu coords)))

(defn ^:export find-path
  [obj-id coord-js]
  (clj->jsu
   (pf/find-path @game obj-id (js->clj coord-js))))

(defn ^:export attack-outcomes
  [obj-id target-id]
  (let [obj (get-in @game [:objects obj-id])
        target (get-in @game [:objects target-id])]
    (clj->jsu
     (attack/get-attack-possibilities obj target))))

(defn ^:export shoot-outcomes
  [obj-id target-id]
  (let [obj (get-in @game [:objects obj-id])
        target (get-in @game [:objects target-id])
        d (core/obj-distance obj target)]
    (clj->jsu
     (attack/get-shot-possibilities obj target d))))

(defn ^:export can-levelup
  [obj-id]
  (nil? (check/can-levelup @game obj-id)))

(defn ^:export get-player-ids
  "Gets a list of player ids in the order of their turns."
  []
  (clj->jsu (:turn-order @game)))

(defn ^:export get-player
  [p]
  (clj->jsu (get-in @game [:players p])))

(defn ^:export get-active-players
  "Returns ids of active players."
  []
  (clj->jsu (:active-players @game)))
