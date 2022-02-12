(ns engine.actions-test
  (:require [engine.core :as core]
            [engine.actions :as actions]
            [engine.newgame :refer [create-test-game]]
            #?(:clj  [clojure.test :refer [deftest is]]
               :cljs [cljs.test :refer-macros [deftest is]])))

(deftest invalid-action-test
  (let [g (create-test-game)
        g-after (actions/act g 0 :invalid {})]
    (is (actions/invalid-result? g-after))
    (is (= :unknown-action g-after))
    (is (actions/check g 0 :invalid {}))))

(deftest get-action-result-test
  (let [g (create-test-game)
        sp-id (core/get-object-id-at g [2 0])
        [g-after result] (actions/get-action-result g 0
                                                    :move
                                                    {:obj-id sp-id
                                                     :new-position [1 1]})
        [g-after-invalid result-invalid] (actions/get-action-result g 0
                                                                    :invalid
                                                                    {})]
    (is (= [1 1] (get-in g-after [:objects sp-id :position])))
    (is (:success result))
    (is (= :move-object (:command (last (:commands result)))))
    (is (= g g-after-invalid))
    (is (= {:success false :error :unknown-action} result-invalid))))
