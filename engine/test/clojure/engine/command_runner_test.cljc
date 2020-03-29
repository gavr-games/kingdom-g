(ns engine.command-runner-test
  (:require [engine.actions :refer [act]]
            [engine.core :as core :refer [get-object-id-at]]
            [engine.newgame :refer [create-test-game]]
            [engine.command-runner :refer [run-command]]
            #?(:clj  [clojure.test :refer [deftest is]]
               :cljs [cljs.test :refer-macros [deftest is]])))

(deftest run-commands-move-attack-end-turn-test
  (let [g (create-test-game)
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        castle-id (get-object-id-at g [0 0])
        g-after (-> g
                    (act 0 :move {:obj-id sp1-id :new-position [3 1]})
                    (act 0 :attack {:obj-id sp2-id :target-id castle-id})
                    (act 0 :end-turn {}))
        new-commands (subvec (g-after :commands) (count (g :commands)))
        g4p (core/get-state-for-player g 0)
        g4p-after (reduce run-command g4p new-commands)]
    (is (= (core/get-state-for-player g-after 0) g4p-after))))
