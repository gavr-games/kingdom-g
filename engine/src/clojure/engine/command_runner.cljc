(ns engine.command-runner
  (:require [engine.core :as core]
            #?(:clj  [clojure.edn :as edn]
               :cljs [cljs.reader :as edn])))


(defmulti run-command
  "Changes the game state according to the passed command."
  (fn [g cmd] (:command cmd)))

(defmethod run-command :default
  [g cmd]
  g)

(defn apply-command
  "Adds command to the game and runs it."
  [g cmd]
  (-> g
      (update-in [:commands] conj cmd)
      (run-command cmd)))


(defmethod run-command :add-object
  [g cmd]
  (let [obj-id (:object_id cmd)
        obj (edn/read-string (:object_edn cmd))]
    (core/add-object g obj-id obj)))

(defmethod run-command :remove-object
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (-> g
        (core/remove-object-coords obj-id)
        (update-in [:objects] dissoc obj-id))))

(defmethod run-command :move-object
  [g cmd]
  (let [obj-id (:object_id cmd)
        {:keys [position flip rotation]} cmd]
    (core/move-object-on-board g obj-id position flip rotation)))

(defmethod run-command :set-moves
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :moves (:moves cmd))))

(defmethod run-command :set-health
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :health (:health cmd))))

(defmethod run-command :set-experience
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :experience (:experience cmd))))

(defmethod run-command :set-level
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :level (:level cmd))))

(defmethod run-command :set-active-players
  [g cmd]
  (assoc g :active-players (set (:players cmd))))

(defmethod run-command :change-gold
  [g cmd]
  (update-in g [:players (:player cmd) :gold] + (:amount cmd)))

(defmethod run-command :player-lost
  [g cmd]
  (assoc-in g [:players (:player cmd) :status] :lost))

(defmethod run-command :player-won
  [g cmd]
  (assoc-in g [:players (:player cmd) :status] :won))

(defmethod run-command :game-over
  [g cmd]
  (assoc g :status :over))


(defmethod run-command :binds
  [g cmd]
  (let [obj-id (:object_id cmd)
        target-id (:target_id cmd)]
    (-> g
        (assoc-in [:objects obj-id :binding-to] target-id)
        (assoc-in [:objects target-id :binding-from] obj-id))))

(defmethod run-command :unbinds
  [g cmd]
  (let [obj-id (:object_id cmd)
        target-id (:target_id cmd)]
    (-> g
        (update-in [:objects obj-id] dissoc :binding-to)
        (update-in [:objects target-id] dissoc :binding-from))))

(defmethod run-command :set-shield
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :shield (:shield cmd))))

(defmethod run-command :set-max-moves
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :max-moves (:max-moves cmd))))

(defmethod run-command :set-max-health
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :max-health (:max-health cmd))))

(defmethod run-command :set-attack
  [g cmd]
  (let [obj-id (:object_id cmd)]
    (update-in g [:objects obj-id] assoc :attack (:attack cmd))))
