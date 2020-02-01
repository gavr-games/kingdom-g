(ns client.api-test
  (:require [client.api :as api]
            [engine.newgame :refer [create-new-game]]
            [cljs.test :refer-macros [deftest is]]))


(deftest roundtrip
  ; TODO Create a game, export to json, initialise client game, check that they are the same
  (let [g "HERE WILL BE GAME DATA"]
    (api/init-game (clj->js g))
    (is (= g @api/game))))

