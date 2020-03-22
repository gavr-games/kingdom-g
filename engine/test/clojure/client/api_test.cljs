(ns client.api-test
  (:require [client.api :as api]
            [engine.newgame :refer [create-test-game]]
            [engine.core :as core]
            [cljs.test :refer-macros [deftest is]]))


(deftest roundtrip-test
  (let [g (create-test-game)
        g4p (core/get-state-for-player g 0)
        g4p-edn (prn-str g4p)]
    (api/init-game (clj->js g))
    (is (= g4p @api/game))))

