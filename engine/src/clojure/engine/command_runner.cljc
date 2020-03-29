(ns engine.command-runner
  (:require [engine.core :as core]
            #?(:clj  [clojure.edn :as edn]
               :cljs [cljs.reader :as edn])))


(defn apply-command
  "Adds command to the game and runs it."
  [g cmd]
  (-> g
      (update-in [:commands] conj cmd)
      (run-command cmd)))


(defmulti run-command
  "Changes the game state according to the passed command."
  (fn [g cmd] (:command cmd)))

(defmethod run-command :default
  [g cmd]
  g)

(defmethod run-command :add-object
  [g cmd]
  (let [obj-id (:object-id cmd)
        obj (edn/read-string (:object-edn cmd))]
    (core/add-object g obj-id obj)))

(defmethod run-command :remove-object
  [g cmd]
  (let [obj-id (:object-id cmd)
        obj (edn/read-string (:object-edn cmd))]
    (-> g
        (core/remove-object-coords obj-id)
        (update-in [:objects] dissoc obj-id))))


(defmethod run-command :remove-object
  [g cmd]
  (let [obj-id (:object-id cmd)
        obj (edn/read-string (:object-edn cmd))]
    (-> g
        (core/remove-object-coords obj-id)
        (update-in [:objects] dissoc obj-id))))

(defmethod run-command :move-object
  [g cmd]
  (let [{:keys [object-id position flip rotation]} cmd]
    (core/move-object-on-board g object-id position flip rotation)))







(defn set-moves
  ([obj-id old-obj obj] (set-moves obj-id obj))
  ([obj-id obj]
   {:command :set-moves :object-id obj-id :moves (obj :moves)}))

(defn set-active-player
  [p]
  {:command :set-active-player :player p})

(defn end-turn
  [p]
  {:command :end-turn :player p})

(defn change-gold
  ([p amount] (change-gold p amount nil))
  ([p amount obj-id]
   (let [cmd {:command :set-gold :player p :amount amount}]
     (if obj-id
       (assoc cmd :object-id obj-id)
       cmd))))

(defn set-health
  ([obj-id old-obj obj] (set-health obj-id obj))
  ([obj-id obj]
   {:command :set-health :object-id obj-id :health (obj :health)}))

(defn set-experience
  ([obj-id old-obj obj] (set-experience obj-id obj))
  ([obj-id obj]
   {:command :set-experience :object-id obj-id :experience (obj :experience)}))

(defn attack
  [obj-id target-id params]
  {:command :attack :attacker obj-id :target target-id :params params})

(defn player-lost
  [p]
  {:command :player-lost :player p})

(defn player-won
  [p]
  {:command :player-won :player p})

(defn game-over
  []
  {:command :game-over})

(defn binds
  [obj-id target-id]
  {:command :binds :object-id obj-id :target target-id})

(defn unbinds
  [obj-id target-id]
  {:command :unbinds :object-id obj-id :target target-id})
