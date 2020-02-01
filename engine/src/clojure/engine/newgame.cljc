(ns engine.newgame
  (:require [engine.core :refer [add-player
                                 create-player
                                 set-active-player
                                 set-player-main-object]]
            [engine.objects :refer [add-new-object]]))

(def board-size-x 20)
(def board-size-y 20)

(def initial-gold 100)

(defn- create-empty-board
  [size-x size-y]
  (zipmap (for [x (range size-x) y (range size-y)] [x y]) (repeat {})))

(defn- create-empty-game []
  {:board
   (create-empty-board board-size-x board-size-y)
   :players {}
   :turn-order []
   :active-player nil
   :objects {}
   :actions []
   :commands []
   :status :active
   :last-added-object-id -1
   :last-added-player -1})

(defn add-initial-player-objects
  "Adds castle and initial spearmen."
  [g p quarter]
  (case quarter
    0 (-> g
          (add-new-object p :castle [0 0] 0 0)
          (set-player-main-object p)
          (add-new-object p :spearman [2 0])
          (add-new-object p :spearman [0 2]))
    1 (-> g
          (add-new-object p :castle [(dec board-size-x) 0] 0 1)
          (set-player-main-object p)
          (add-new-object p :spearman [(- board-size-x 3) 0])
          (add-new-object p :spearman [(dec board-size-x) 2]))
    2 (-> g
          (add-new-object p :castle [(dec board-size-x) (dec board-size-y)] 0 2)
          (set-player-main-object p)
          (add-new-object p :spearman [(dec board-size-x) (- board-size-y 3)])
          (add-new-object p :spearman [(- board-size-x 3) (dec board-size-y)]))
    3 (-> g
          (add-new-object p :castle [0 (dec board-size-y)] 0 3)
          (set-player-main-object p)
          (add-new-object p :spearman [2 (dec board-size-y)])
          (add-new-object p :spearman [0 (- board-size-y 3)]))))

(defn add-player-and-objects
  [g p team quarter]
  (-> g
      (add-player p (create-player team initial-gold))
      (add-initial-player-objects p quarter)))

(defn create-test-game []
  (-> (create-empty-game)
      (add-player-and-objects 0 0 0)
      (add-player-and-objects 1 1 2)
      (set-active-player 0)))
