(ns client.api-test
  (:require [client.api :as api]
            [engine.newgame :refer [create-test-game]]
            [engine.core :as core]
            [cljs.test :refer-macros [deftest is]]))

(defn init-test-game
  []
  (-> (create-test-game)
      (core/get-state-for-player 0)
      prn-str
      api/init-game))

(deftest roundtrip-test
  (let [g (create-test-game)
        g4p (core/get-state-for-player g 0)
        g4p-edn (prn-str g4p)]
    (api/init-game g4p-edn)
    (is (= g4p @api/game))))

(deftest get-objects-test
  (init-test-game)
  (let [objects (js->clj (api/get-objects))
        castle (get objects "0")]
    (is (= 6 (count objects)))
    (is (= "castle" (get castle "type")))))

(deftest apply-command-test
  (init-test-game)
  (let [initial-gold (get-in @api/game [:players 0 :gold])
        expected-gold (+ initial-gold 10)
        cmd-json "{\"command\":\"change-gold\", \"player\":0, \"amount\":10}"
        cmd-js (.parse js/JSON cmd-json)]
    (api/apply-command cmd-js)
    (is (= expected-gold (get-in @api/game [:players 0 :gold])))))
