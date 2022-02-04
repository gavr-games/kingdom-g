(ns engine.abilities-test
  (:require [engine.actions :refer [act check]]
            [engine.abilities]
            [engine.core :as core :refer [get-object-id-at update-object]]
            [engine.newgame :refer [create-test-game create-game]]
            [engine.objects :refer [add-new-object add-new-active-object]]
            [engine.object-utils :as obj]
            #?(:clj  [clojure.test :refer [deftest is]]
               :cljs [cljs.test :refer-macros [deftest is]])))

(deftest test-move-attack
  (let [g (create-test-game)
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        g-moved (act g 0 :move {:obj-id sp1-id :new-position [1 1]})
        g-attacked (act g-moved 0 :attack {:obj-id sp2-id :target-id sp1-id})]
    (is (= [1 1] (get-in g-moved [:objects sp1-id :position])))
    (is (nil? (get-in g-attacked [:objects sp1-id])))
    (is (= #{1} (g-attacked :active-players)))))

(deftest test-invalid-actions
  (let [g (create-test-game)]
    (is (check g 2 :move {:obj-id 1 :new-position [1 1]}))
    (is (check g 0 :move {:obj-id 1 :new-position [5 5]}))
    (is (check g 2 :move {:obj-id 4 :new-position [18 18]}))
    (is (check g 0 :move {:obj-id 1 :new-position [1 0]}))
    (is (check g 2 :attack {:obj-id 1 :target-id 2}))))

(deftest test-end-game
  (let [ng (create-test-game)
        sp (get-object-id-at ng [2 0])
        castle (get-object-id-at ng [0 0])
        g (core/damage-obj ng 0 castle 9)
        go (act g 0 :attack {:obj-id sp :target-id castle})]
    (is (check go 0 :move {:obj-id 2 :new-position [1 1]}))
    (is (= :over (go :status)))
    (is (= :lost (get-in go [:players 0 :status])))
    (is (= :won (get-in go [:players 1 :status])))))

(deftest test-move-to-empty-cell
  (let [g (create-test-game)
        sp1-id (get-object-id-at g [2 0])
        g-moved (act g 0 :move {:obj-id sp1-id :new-position [3 1]})]
    (is (= [3 1] (get-in g-moved [:objects sp1-id :position])))))

(deftest test-reward
  (let [r 10
        g (create-test-game)
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        gold-before (get-in g [:players 0 :gold])
        g-after (-> g
                    (assoc-in [:objects sp1-id :reward] r)
                    (act 0 :move {:obj-id sp1-id :new-position [1 1]})
                    (act 0 :attack {:obj-id sp2-id :target-id sp1-id}))
        gold-after (get-in g-after [:players 0 :gold])]
    (is (= gold-after (+ gold-before r)))))


(deftest test-drowning
  (let [g (create-test-game)
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        g-after (-> g
                    (add-new-object :puddle [2 2])
                    (act 0 :move {:obj-id sp1-id :new-position [2 1]})
                    (act 0 :move {:obj-id sp1-id :new-position [2 2]})
                    (add-new-object :bridge [2 2])
                    (act 0 :move {:obj-id sp2-id :new-position [1 2]})
                    (act 0 :move {:obj-id sp2-id :new-position [2 2]}))]
    (is (not (get-in g-after [:objects sp1-id])))
    (is (get-in g-after [:objects sp2-id]))))

(deftest test-experience
  (let [g (-> (create-test-game)
              (add-new-object :tree [3 0]))
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        castle-id (get-object-id-at g [0 0])
        tree-id (get-object-id-at g [3 0])
        g-after (-> g
                    (act 0 :attack {:obj-id sp1-id :target-id tree-id})
                    (act 0 :attack {:obj-id sp2-id :target-id castle-id}))]
    (is (zero? (get-in g-after [:objects sp1-id :experience] 0)))
    (is (pos? (get-in g-after [:objects sp2-id :experience])))))

(deftest test-binding
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :ram [2 1]))
        sp1-id (get-object-id-at g [2 0])
        ram-id (get-object-id-at g [2 1])
        castle-id (get-object-id-at g [0 0])
        g (-> g
              (act 0 :bind {:obj-id ram-id :target-id sp1-id})
              (act 0 :move {:obj-id sp1-id :new-position [3 0]})
              (update-object ram-id obj/activate))
        unbound? (fn [g]
                   (let [ram-pos (get-in g [:objects ram-id :position])
                         [sp-x sp-y] (get-in g [:objects sp1-id :position])
                         g (act
                            g
                            0
                            :move
                            {:obj-id sp1-id :new-position [(inc sp-x) sp-y]})
                         ram-pos-after (get-in g [:objects ram-id :position])]
                     (= ram-pos ram-pos-after)))]
    (is (= [2 0] (get-in g [:objects ram-id :position])))
    (is (unbound? (act g 0 :move {:obj-id ram-id :new-position [1 1]})))
    (is (unbound? (act g 0 :attack {:obj-id ram-id :target-id castle-id})))
    (is (unbound? (core/move-object g 0 ram-id [5 5])))
    (is (unbound? (core/move-object g 0 sp1-id [5 5])))
    (is (map? (-> g
                  (core/destroy-obj 0 sp1-id)
                  (act 0 :move {:obj-id ram-id :new-position [1 1]}))))
    (is (map? (-> g
                  (core/destroy-obj 0 ram-id)
                  (act 0 :move {:obj-id sp1-id :new-position [4 0]}))))))

(deftest test-binding-to-dragon
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :ram [2 2])
              (add-new-active-object 0 :dragon [3 3]))
        ram-id (get-object-id-at g [2 2])
        dragon-id (get-object-id-at g [3 3])
        g (-> g
              (act 0 :bind {:obj-id ram-id :target-id dragon-id})
              (act 0 :move {:obj-id dragon-id :new-position [3 2]}))
        ram-pos-2 (get-in g [:objects ram-id :position])
        g (act g 0 :move {:obj-id dragon-id :new-position [4 2]})
        ram-pos-3 (get-in g [:objects ram-id :position])]
    (is (= [3 4] ram-pos-2))
    (is (= [3 3] ram-pos-3))))

(deftest test-dragon-move
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :dragon [3 3]))
        dragon-id (get-object-id-at g [3 3])]
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [2 2]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [2 3]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [2 4]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [3 2]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [3 4]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [4 2]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [4 3]})))
    (is (not (check g 0 :move {:obj-id dragon-id :new-position [4 4]})))))

(deftest test-dragon-splash-attack
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :dragon [1 1]))
        dragon-id (get-object-id-at g [1 1])
        sp1-id (get-object-id-at g [2 0])
        castle-id (get-object-id-at g [0 0])
        g-castle (act g 0 :splash-attack
                      {:obj-id dragon-id :attack-position [0 0]})
        g-both (act g 0 :splash-attack
                    {:obj-id dragon-id :attack-position [1 0]})
        g-sp (act g 0 :splash-attack
                  {:obj-id dragon-id :attack-position [2 0]})
        castle-damaged? #(obj/damaged? (get-in % [:objects castle-id]))
        spearman_killed? #(not (get-in % [:objects sp1-id]))]
    (is (and (castle-damaged? g-castle) (not (spearman_killed? g-castle))))
    (is (and (castle-damaged? g-both) (spearman_killed? g-both)))
    (is (and (not (castle-damaged? g-sp)) (spearman_killed? g-sp)))
    (is (check g 0 :splash-attack {:obj-id dragon-id :attack-position [1 1]}))
    (is (check g 0 :splash-attack {:obj-id dragon-id :attack-position [2 2]}))))


(deftest test-shoot
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :marksman [3 0]))
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [0 2])
        sp3-id (get-object-id-at g [19 17])
        castle-id (get-object-id-at g [0 0])
        marksman-id (get-object-id-at g [3 0])
        g-after (act g 0 :shoot {:obj-id marksman-id :target-id sp2-id})]
    (is (not (get-in g-after [:objects sp2-id])))
    (is (= :target-too-close
           (check g 0 :shoot {:obj-id marksman-id :target-id sp1-id})))
    (is (= :target-too-far
           (check g 0 :shoot {:obj-id marksman-id :target-id sp3-id})))
    (is (= :shooting-target-not-applicable
           (check g 0 :shoot {:obj-id marksman-id :target-id castle-id})))))


(deftest test-shoot-tree
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :archer [3 0])
              (add-new-object :tree [3 1])
              (add-new-object :tree [3 2])
              (add-new-object :tree [3 3])
              (add-new-object :tree [3 4])
              (add-new-object :tree [3 5]))
        archer-id (get-object-id-at g [3 0])
        t1-id (get-object-id-at g [3 1])
        t2-id (get-object-id-at g [3 2])
        t3-id (get-object-id-at g [3 3])
        t4-id (get-object-id-at g [3 4])
        t5-id (get-object-id-at g [3 5])
        shoot-tree (fn [game]
                     (-> game
                         (act 0 :shoot {:obj-id archer-id :target-id t4-id})
                         (update-object archer-id obj/activate)))
        g-after (first (drop-while
                        #(zero? (get-in % [:objects archer-id :experience]))
                        (take 1000 (iterate shoot-tree g))))]
    (is (check g 0 :shoot {:obj-id archer-id :target-id t1-id}))
    (is (check g 0 :shoot {:obj-id archer-id :target-id t2-id}))
    (is (check g 0 :shoot {:obj-id archer-id :target-id t3-id}))
    (is (check g 0 :shoot {:obj-id archer-id :target-id t5-id}))
    (is (nil? (check g 0 :shoot {:obj-id archer-id :target-id t4-id})))
    (is (< 0 (count (g-after :actions)) 1000))))

(deftest test-ram-push
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :ram [5 5])
              (add-new-object :tree [4 6])
              (add-new-object :spearman [5 4])
              (add-new-object :spearman [4 4])
              (add-new-object :puddle [5 3]))
        ram-id (get-object-id-at g [5 5])
        tree-id (get-object-id-at g [4 6])
        s-n-drowns-id (get-object-id-at g [5 4])
        s-nw-id (get-object-id-at g [4 4])
        ram-attack (fn [game obj-id]
                     (-> game
                         (act 0 :attack {:obj-id ram-id :target-id obj-id})
                         (update-object ram-id obj/activate)))
        g-after (-> g
                    (ram-attack tree-id)
                    (ram-attack s-n-drowns-id)
                    (ram-attack s-nw-id))]
    (is (nil? (get-in g-after [:objects tree-id])))
    (is (nil? (get-in g-after [:objects s-n-drowns-id])))
    (is (= [3 3] (get-in g-after [:objects s-nw-id :position])))))

(deftest test-ram-domino-push
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :ram [5 5])
              (add-new-object :dragon [6 6])
              (add-new-object :spearman [8 7])
              (add-new-object :spearman [8 8])
              (add-new-object :spearman [7 8])
              (add-new-object :dragon [9 8]))
        ram-id (get-object-id-at g [5 5])
        d1-id (get-object-id-at g [6 6])
        d2-id (get-object-id-at g [9 8])
        s1-id (get-object-id-at g [8 7])
        s2-id (get-object-id-at g [8 8])
        s3-id (get-object-id-at g [7 8])
        g-after (act g 0 :attack {:obj-id ram-id :target-id d1-id})
        pos-after #(get-in g-after [:objects % :position])]
    (is (= [7 7] (pos-after d1-id)))
    (is (= [10 9] (pos-after d2-id)))
    (is (= [9 8] (pos-after s1-id)))
    (is (= [9 9] (pos-after s2-id)))
    (is (= [8 9] (pos-after s3-id)))))

((deftest test-ram-blocked-push
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :ram [2 1])
              (add-new-object :spearman [3 1])
              (add-new-object :tree [4 1]))
        ram-id (get-object-id-at g [2 1])
        s1-id (get-object-id-at g [2 0])
        s2-id (get-object-id-at g [3 1])
        g-after (-> g
                    (act 0 :attack {:obj-id ram-id :target-id s1-id})
                    (update-object ram-id obj/activate)
                    (act 0 :attack {:obj-id ram-id :target-id s2-id}))
        pos-after #(get-in g-after [:objects % :position])]
    (is (= [2 0] (pos-after s1-id)))
    (is (= [3 1] (pos-after s2-id))))))


(deftest test-flying
  (let [g (-> (create-test-game)
              (add-new-active-object 0 :dragon [1 1]))
        d-id (get-object-id-at g [1 1])
        g-after (act g 0 :move {:obj-id d-id :new-position [3 3]})
        d-after (get-in g-after [:objects d-id])]
    (is (= [3 3] (d-after :position)))
    (is (= (- (d-after :max-moves) 2) (d-after :moves)))
    (is (not (check g 0 :move {:obj-id d-id :new-position [2 2]})))
    (is (not (check g 0 :move {:obj-id d-id :new-position [7 7]})))
    (is (check g 0 :move {:obj-id d-id :new-position [8 8]}))))

(deftest test-chess-knight
  (let [g (-> (create-test-game)
              (add-new-object 0 :chevalier [2 1] nil nil
                              {:chess-knight true :moves 1}))
        k-id (get-object-id-at g [2 1])
        s1-id (get-object-id-at g [2 0])
        s2-id (get-object-id-at g [0 2])
        c-id (get-object-id-at g [0 0])
        g-after (act g 0 :move {:obj-id k-id :new-position [3 3]})
        k-after (get-in g-after [:objects k-id])]
    (is (= [3 3] (k-after :position)))
    (is (check g 0 :move {:obj-id k-id :new-position [3 1]}))
    (is (check g 0 :move {:obj-id k-id :new-position [3 2]}))
    (is (check g 0 :move {:obj-id k-id :new-position [4 1]}))
    (is (check g 0 :move {:obj-id k-id :new-position [5 1]}))
    (is (check g 0 :attack {:obj-id k-id :target-id s1-id}))
    (is (not (check g 0 :attack {:obj-id k-id :target-id s2-id})))
    (is (not (check g 0 :attack {:obj-id k-id :target-id c-id})))))

(deftest test-flying-chess-knight
  (let [g (-> (create-test-game)
              (add-new-object 0 :dragon [1 1] nil nil
                              {:chess-knight true :moves 6}))
        d-id (get-object-id-at g [1 1])]
    (is (check g 0 :move {:obj-id d-id :new-position [2 2]}))
    (is (check g 0 :move {:obj-id d-id :new-position [3 3]}))
    (is (check g 0 :move {:obj-id d-id :new-position [4 4]}))
    (is (not (check g 0 :move {:obj-id d-id :new-position [3 2]})))))

(deftest attack-shielded-test
  (let [g (-> (create-test-game)
              (add-new-object 0 :wizard [1 1]))
        sp-id (get-object-id-at g [2 0])
        w-id (get-object-id-at g [1 1])
        g-after (act g 0 :attack {:obj-id sp-id :target-id w-id})]
    (is (= (get-in g-after [:objects w-id :health])
           (get-in g [:objects w-id :health])))
    (is (< (get-in g-after [:objects w-id :shield])
           (get-in g [:objects w-id :shield])))))

(deftest levelup-test
  (let [g (create-test-game)
        sp-id (get-object-id-at g [2 0])
        sp (get-in g [:objects sp-id])
        g-low-exp (assoc-in g [:objects sp-id :experience] 1)
        g-top-level (-> g
                        (assoc-in [:objects sp-id :experience] 100)
                        (assoc-in [:objects sp-id :level] 3))
        g-can-levelup (assoc-in g [:objects sp-id :experience] 5)
        g-leveled-m (act g-can-levelup 0 :levelup
                         {:obj-id sp-id :stat "moves"})
        g-leveled-a (act g-can-levelup 0 :levelup
                         {:obj-id sp-id :stat "attack"})
        g-leveled-h (act g-can-levelup 0 :levelup
                         {:obj-id sp-id :stat "health"})]

    (is (check g 0 :levelup {:obj-id sp-id :stat "moves"}))
    (is (check g-low-exp 0 :levelup {:obj-id sp-id :stat "attack"}))
    (is (check g-top-level 0 :levelup {:obj-id sp-id :stat "health"}))
    (is (check g-can-levelup 0 :levelup {:obj-id sp-id :stat "invalid"}))

    (is (not (check g-can-levelup 0 :levelup {:obj-id sp-id :stat "moves"})))

    (is (= 1 (get-in g-leveled-m [:objects sp-id :level])))
    (is (zero? (get-in g-leveled-m [:objects sp-id :moves])))
    (is (= (inc (:max-moves sp))
           (get-in g-leveled-m [:objects sp-id :max-moves])))
    (is (= (:health sp) (get-in g-leveled-m [:objects sp-id :health])))
    (is (= (:max-health sp) (get-in g-leveled-m [:objects sp-id :max-health])))
    (is (= (:attack sp) (get-in g-leveled-m [:objects sp-id :attack])))

    (is (= (inc (:max-health sp))
           (get-in g-leveled-h [:objects sp-id :max-health])))
    (is (= (inc (:health sp))
           (get-in g-leveled-h [:objects sp-id :health])))

    (is (= (inc (:attack sp))
           (get-in g-leveled-a [:objects sp-id :attack])))))

(deftest previous-position-test
  (let [g (-> (create-test-game))
        sp1-id (get-object-id-at g [2 0])
        sp2-id (get-object-id-at g [19 17])
        g1 (act g 0 :move {:obj-id sp1-id :new-position [1 1]})
        g2 (act g1 0 :move {:obj-id sp1-id :new-position [2 2]})]
    (is (= [1 -1] (get-in g [:objects sp1-id :previous-position])))
    (is (= [20 18] (get-in g [:objects sp2-id :previous-position])))
    (is (= [2 0] (get-in g1 [:objects sp1-id :previous-position])))
    (is (= [1 1] (get-in g2 [:objects sp1-id :previous-position])))))

(deftest team-simultaneously-active-test
  (let [players [{:id 0 :team 0 :quarter 0}
                 {:id 1 :team 1 :quarter 1}
                 {:id 2 :team 0 :quarter 2}
                 {:id 3 :team 1 :quarter 3}]
        g (create-game players)
        g1 (act g 0 :end-turn {})
        g2 (act g1 2 :end-turn {})
        sp0-id (get-object-id-at g [2 0])
        sp1-id (get-object-id-at g [17 0])
        sp2-id (get-object-id-at g [19 17])]

    (is (not (check g 0 :move {:obj-id sp0-id :new-position [1 1]})))
    (is (not (check g 2 :move {:obj-id sp2-id :new-position [18 18]})))
    (is (check g 1 :move {:obj-id sp1-id :new-position [18 1]}))

    (is (not (check g 0 :end-turn {})))
    (is (not (check g 2 :end-turn {})))
    (is (check g 1 :end-turn {}))

    (is (check g1 0 :move {:obj-id sp0-id :new-position [1 1]}))
    (is (not (check g1 2 :move {:obj-id sp2-id :new-position [18 18]})))
    (is (check g1 1 :move {:obj-id sp1-id :new-position [18 1]}))

    (is (check g1 0 :end-turn {}))
    (is (not (check g1 2 :end-turn {})))
    (is (check g1 1 :end-turn {}))

    (is (check g2 0 :move {:obj-id sp0-id :new-position [1 1]}))
    (is (check g2 2 :move {:obj-id sp2-id :new-position [18 18]}))
    (is (not (check g2 1 :move {:obj-id sp1-id :new-position [18 1]})))

    (is (check g2 0 :end-turn {}))
    (is (check g2 2 :end-turn {}))
    (is (not (check g2 1 :end-turn {})))))
