(ns engine.pathfinding-test
  (:require [engine.pathfinding :refer [find-path]]
            [engine.newgame :refer [create-test-game]]
            [engine.core :as core :refer [get-object-id-at]]
            [engine.objects :refer [add-new-object add-new-active-object]]
            #?(:clj  [clojure.test :refer [deftest is]]
               :cljs [cljs.test :refer-macros [deftest is]])))

(deftest one-step-test
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :spearman [5 5])
              (add-new-object :spearman [4 5]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[4 5]] (find-path g u-id [4 5])))
    (is (= [[6 5]] (find-path g u-id [6 5])))))

(deftest straight-walk-test
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :spearman [5 5])
              (add-new-object :spearman [3 5])
              (add-new-object :spearman [2 5]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[4 5] [3 5]] (find-path g u-id [3 5])))
    (is (= [[4 4] [3 3]] (find-path g u-id [3 3])))
    (is (nil? (find-path g u-id [2 2])))
    (is (nil? (find-path g u-id [2 5])))))

(deftest obstacle-test
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :spearman [5 5])
              (add-new-object :tree [4 5])
              (add-new-object :tree [4 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[4 4] [3 5]] (find-path g u-id [3 5])))
    (is (= [[5 6] [4 7]] (find-path g u-id [4 7])))
    (is (nil? (find-path g u-id [3 7])))))

(deftest long-obstacle-test
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :chevalier [5 5])
              (add-new-object :tree [4 6])
              (add-new-object :tree [5 6])
              (add-new-object :tree [6 6])
              (add-new-object :tree [7 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[4 5] [3 6] [4 7] [5 7]] (find-path g u-id [5 7])))))

(deftest chess-knight-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :chevalier [5 5] nil nil
                              {:chess-knight true :moves 2})
              (add-new-object :tree [4 6])
              (add-new-object :tree [5 6])
              (add-new-object :tree [6 6])
              (add-new-object :tree [7 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[3 6] [5 7]] (find-path g u-id [5 7])))))

(deftest chess-knight2-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :chevalier [5 5] nil nil
                              {:chess-knight true :moves 2})
              (add-new-object :tree [7 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[3 6] [5 7]] (find-path g u-id [5 7])))))

(deftest flying-over-obstacle-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :chevalier [5 5] nil nil
                              {:flying true :moves 2})
              (add-new-object :tree [4 6])
              (add-new-object :tree [5 6])
              (add-new-object :tree [6 6])
              (add-new-object :tree [7 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[5 7]] (find-path g u-id [5 7])))))

(deftest flying-cant-step-onto-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :chevalier [5 5] nil nil
                              {:flying true :moves 2})
              (add-new-object :tree [4 6])
              (add-new-object :tree [5 6])
              (add-new-object :tree [6 6])
              (add-new-object :tree [7 6])
              (add-new-object :spearman [5 7]))
        u-id (get-object-id-at g [5 5])]
    (is (nil? (find-path g u-id [5 7])))))

(deftest water-obstacle-test
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :spearman [5 5])
              (add-new-object :puddle [6 6]))
        u-id (get-object-id-at g [5 5])]
    (is (nil? (find-path g u-id [7 7])))))

(deftest waterwalking-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :spearman [5 5] nil nil
                              {:waterwalking true :moves 2})
              (add-new-object :puddle [6 6]))
        u-id (get-object-id-at g [5 5])]
    (is (= [[6 6] [7 7]] (find-path g u-id [7 7])))))