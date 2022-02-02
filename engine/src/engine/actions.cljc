(ns engine.actions
  (:require [engine.core :as core]
            [engine.commands :as cmd]
            [engine.checks :as check])
  #?(:cljs (:require-macros [engine.actions :refer [create-action]])))


(defmulti
  action
  "Player action distinguished by a keyword code."
  identity)

(defmacro create-action
  "Creates and registers action method for the given code.
  Action method should take game and player-num as first two arguments.
  This method should either return a keyword for an error, or a modified game."
  [code args body]
  `(defmethod action ~code
     [_#]
     (with-meta
       (fn ~args ~body)
       {:args ~(mapv keyword (drop 2 args))})))

(defn invalid-result?
  "Checks if action-result represents an error."
  [action-result]
  (keyword? action-result))


(defn auto-end-turn
  "Ends turn if active players have no active objects."
  [g]
  (if (not-any? #(core/has-active-objects? g %) (:active-players g))
    (core/switch-turn g)
    g))


(defn unknown-action?
  [action-code]
  (when-not (get-method action action-code)
    :unknown-action))


(defn act
  "Performs action and returns the resulting game state or error.
  Params should be a map of keyword arguments."
  [g p action-code params]
  (or
   (unknown-action? action-code)
   (let [act-fn (action action-code)
         param-keys ((meta act-fn) :args)
         param-values (vals (select-keys params param-keys))
         act-call #(apply act-fn % p param-values)
         action-log {:player p :action action-code :params params}
         prechecks-fail (or
                         (check/game g)
                         (check/player g p))]
     (or
      prechecks-fail
      (let [g-after (-> g
                        (update-in [:actions] conj action-log)
                        act-call)
            invalid-action (invalid-result? g-after)]
        (if invalid-action
          g-after
          (auto-end-turn g-after)))))))


(defn check
  "Checks if an action can be performed.
  Returns nil (on valid action) or error.
  Params should be a map of keyword arguments."
  [g p action-code params]
  (let [g-after (act g p action-code params)]
    (if (invalid-result? g-after)
      g-after
      nil)))


(create-action
 :end-turn
 [g p]
 (if (not (core/player-active? g p))
   :not-your-turn
   (-> g
      (cmd/add-command (cmd/end-turn p))
      (core/deactivate-player-objects p))))
