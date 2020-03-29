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

(defmethod run-command :move-object
  [g cmd]
  (let [{:keys [object-id position flip rotation]} cmd]
    (core/move-object-on-board g object-id position flip rotation)))

(defmethod run-command :set-moves
  [g cmd]
  (let [{:keys [object-id moves]} cmd]
    (update-in g [:objects object-id] assoc :moves moves)))

(defmethod run-command :set-health
  [g cmd]
  (let [{:keys [object-id health]} cmd]
    (update-in g [:objects object-id] assoc :health health)))

(defmethod run-command :set-experience
  [g cmd]
  (let [{:keys [object-id experience]} cmd]
    (update-in g [:objects object-id] assoc :experience experience)))

(defmethod run-command :set-active-player
  [g cmd]
  (assoc g :active-player (:player cmd)))

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
  (let [{:keys [object-id target-id]} cmd]
    (-> g
        (assoc-in [:objects object-id :binding-to] target-id)
        (assoc-in [:objects target-id :binding-from] object-id))))

(defmethod run-command :unbinds
  [g cmd]
  (let [{:keys [object-id target-id]} cmd]
    (-> g
        (update-in [:objects object-id] dissoc :binding-to)
        (update-in [:objects target-id] dissoc :binding-from))))

