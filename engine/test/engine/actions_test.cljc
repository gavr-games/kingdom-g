(ns engine.actions-test
  (:require [engine.actions :refer [act check invalid-result?]]
            [engine.newgame :refer [create-test-game]]
            #?(:clj  [clojure.test :refer [deftest is]]
               :cljs [cljs.test :refer-macros [deftest is]])))

(deftest invalid-action-test
  (let [g (create-test-game)
        g-after (act g 0 :invalid {})]
    (is (invalid-result? g-after))
    (is (= :unknown-action g-after))
    (is (check g 0 :invalid {}))))
