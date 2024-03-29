(ns engine.newgame
  (:require [engine.core :refer [add-player
                                 create-player
                                 set-player-main-object
                                 set-active-players]]
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
   :middle-coord [(/ board-size-x 2) (/ board-size-y 2)] ; For board quarters.
   :players {}
   :turn-order []
   :active-players nil
   :objects {}
   :actions []
   :commands []
   :status :active
   :last-added-object-id -1
   :last-added-npc -1})

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
  [g {:keys [id team quarter]}]
  (-> g
      (add-player id (create-player team initial-gold))
      (add-initial-player-objects id quarter)))

(defn get-team-player-sets
  "Returns a vector of teams. Every team is a set of players.
  Teams are ordered by first appearence in the given seq."
  [players]
  (let [teams (distinct (map :team players))
        grouped-players (group-by :team players)
        player-sets (reduce-kv #(assoc %1 %2 (set (map :id %3)))
                               {}
                               grouped-players)]
    (mapv #(player-sets %) teams)))

(defn overwrite-turn-order
  "Overwrites default turn order with simultaneously active players by teams."
  [g players]
  (assoc g :turn-order (get-team-player-sets players)))

(defn set-first-team-active
  [g]
  (let [first-team (first (:turn-order g))]
    (set-active-players g first-team)))

(defn create-game
  "Creates a game with players specified in a seq of player data maps.
  Example player data: {:id 6 :team 0 :quarter 1}.
  The first player in the seq becomes active.
  Player move order is the same as in the seq."
  [players]
  (-> (reduce add-player-and-objects (create-empty-game) players)
      (overwrite-turn-order players)
      set-first-team-active))

(defn create-test-game []
  (create-game [{:id 0 :team 0 :quarter 0}
                {:id 1 :team 1 :quarter 2}]))

(defn count-teams
  [players]
  (count (set (map :team players))))

(defn shuffle-2-players
  [players]
  (let [[p1 p2] (shuffle players)]
    [(assoc p1 :quarter 0) (assoc p2 :quarter 2)]))

(defn shuffle-3-players
  [players]
  (let [[p1 p2 p3] (shuffle players)
        [q1 q2 q3] (cond
                     (= (:team p1) (:team p2)) [0 2 1]
                     (= (:team p2) (:team p3)) [0 1 3]
                     :else [0 1 2])]
    [(assoc p1 :quarter q1) (assoc p2 :quarter q2) (assoc p3 :quarter q3)]))

(defn- without
  "Returns coll without elements that are equal to x."
  [coll x]
  (remove #(= x %) coll))

(defn shuffle-4-players
  [players]
  (let [removable-players (filter #(> (count-teams
                                       (without players %))
                                      1) players)
        removed-player (rand-nth removable-players)
        p3 (without players removed-player)
        p3-shuffled (shuffle-3-players p3)
        q4 (first (reduce without [0 1 2 3] (map :quarter p3-shuffled)))]
    (conj p3-shuffled (assoc removed-player :quarter q4))))

(defn shuffle-players
  "Shuffles players and assignes them to quarters based on teams."
  [players]
  (assert (<= 2 (count players) 4))
  (assert (> (count-teams players) 1))
  (let [shuffle-fn (case (count players)
                     2 shuffle-2-players
                     3 shuffle-3-players
                     4 shuffle-4-players)]
    (shuffle-fn players)))

(defn add-test-objects
  "Adds some objects for testing."
  [g]
  (let [p (get-in g [:objects 0 :player])]
    (-> g
        (add-new-object p :catapult [0 3])
        (add-new-object p :archer [0 4])
        (add-new-object p :ram [0 5])
        (add-new-object p :dragon [0 6])
        (add-new-object p :chevalier [0 8])
        (add-new-object p :marksman [0 9])
        (add-new-object p :wizard [0 10])
        
        (add-new-object :tree [3 0])
        (add-new-object :puddle [4 1])
        (add-new-object :puddle [4 2])
        (add-new-object :puddle [3 2])
        (add-new-object :bridge [4 2]))))

(defn create-game-shuffled-players
  [players]
  (-> (create-game (sort-by :quarter (shuffle-players players)))
      (add-test-objects)))
