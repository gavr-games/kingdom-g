(ns engine.newgame-test
  (:require [engine.core :as core :refer [get-object-id-at]]
            [engine.newgame :refer [create-game]]
            [engine.transformations :refer [translate rotate]]
            #?(:clj  [clojure.test :refer [deftest is are]]
               :cljs [cljs.test :refer-macros [deftest is are]])))

(defn castle-coord
  "Returns the coordinate of the castle of the given quarter."
  [quarter]
  (map int (translate (rotate [-9.5 -9.5] quarter) [9.5 9.5])))

(defn player-placed-correctly
  [g player-data]
  (let [player (get-in g [:players (:id player-data)])]
    (is (= (:team player-data) (:team player)))
    (is (= (get-object-id-at g (castle-coord (:quarter player-data)))
           (:main-object player)))))

(deftest player-placement-test
  (let [players [{:id 5 :team 0 :quarter 0}
                 {:id 6 :team 1 :quarter 1}
                 {:id 7 :team 2 :quarter 2}
                 {:id 8 :team 1 :quarter 3}]
        g (create-game players)]
    (is (= (:id (first players)) (g :active-player)))
    (dorun (map #(player-placed-correctly g %) players))))
