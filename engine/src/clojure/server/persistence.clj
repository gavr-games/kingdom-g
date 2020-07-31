(ns server.persistence
  (:require [taoensso.carmine :as car :refer (wcar)]))

(def redis-conn {:pool {} :spec {:uri (System/getenv "REDIS_URL")}})
(defmacro wcar* [& body] `(car/wcar redis-conn ~@body))

(def game-key-prefix "game:")

(defn game-id-to-key
  [game-id]
  (str game-key-prefix game-id))

(defn key-to-game-id
  [game-key]
  (Integer/valueOf (subs game-key (count game-key-prefix))))

(defn save-game
  [game-id game]
  (let [game-key (game-id-to-key game-id)]
    (println "Saving game" game-id)
    (wcar* (car/set game-key game))))

(defn load-game
  [game-key]
  (wcar* (car/get game-key)))

(defn save-games [games]
  "Saves the passed games to redis db.
  Games is a dictionary from game id to game object."
  (doall
   (map #(apply save-game %) games)))


(defn load-games []
  "Loads all games from redis, returns a dictionary from game id to game object."
  (let [game-keys (wcar* (car/keys (str game-key-prefix "*")))]
    (into {} (for [k game-keys] [(key-to-game-id k) (load-game k)]))))
