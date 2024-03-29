(ns engine.core
  (:require [engine.object-utils :as obj]
            [clojure.set :as set]
            [engine.commands :as cmd]
            [engine.handlers :refer [handle]]
            [engine.transformations :refer [transform-coords distance]]
            [engine.utils :refer [deep-merge insert-after]]))

(defn create-player
  "Returns a map with player data."
  [team gold]
  {:gold gold :team team :status :active :main-object nil})

(defn add-player
  "Adds a player with given player id and player data.
  In the turn order the new player will be placed after current active-players."
  [g p player-data]
  (-> g
      (assoc-in [:players p] player-data)
      (update :turn-order insert-after #{p} (g :active-players))))

(defn add-npc
  "Adds an NPC player with auto-generated player id."
  [g npc-player-data]
  (let [next-npc-number (inc (:last-added-npc g))
        npc-player-id (str "npc" next-npc-number)]
    (-> g
        (add-player npc-player-id npc-player-data)
        (update :last-added-npc inc))))

(defn set-player-main-object
  "Sets the main object for the player.
  If no object is provided, takes the last added object."
  ([g p]
   (set-player-main-object g p (:last-added-object-id g)))
  ([g p obj-id]
   (assoc-in g [:players p :main-object] obj-id)))

(defn set-object-placement
  "Updates object flip, rotation (if given and not nil) and position."
  ([obj position] (set-object-placement obj position nil nil))
  ([obj position flip rotation]
   (cond-> obj
     true (assoc :position position)
     flip (assoc :flip flip)
     rotation (assoc :rotation rotation))))

(defn transform-coords-map
  "Transforms every key in coords (every key should be a coord)."
  [coords position flip rotation]
  (zipmap
   (transform-coords (keys coords) flip rotation position)
   (vals coords)))

(defn get-object-coords-map
  "Returns a map from coord to its parameters.
  Example output for castle:
  {(0 0) {:fill :solid},
  (0 1) {:fill :solid},
  (1 0) {:fill :solid},
  (1 1) {:fill :floor, :spawn true}}"
  [obj]
  (let [coords (obj :coords)]
    (transform-coords-map coords (obj :position) (obj :flip) (obj :rotation))))

(defn place-object-on-board
  [g obj-id]
  (let [obj (get-in g [:objects obj-id])
        obj-coords (get-object-coords-map obj)
        board-data (into {}
                         (map
                          (fn [[k v]] [k {obj-id v}])
                          obj-coords))]
    (update g :board deep-merge board-data)))

(defn remove-object-coords
  "Removes object from board"
  [g obj-id]
  (let [obj (get-in g [:objects obj-id])
        obj-coords (keys (get-object-coords-map obj))]
    (reduce
     (fn [game coord]
       (update-in game [:board coord] dissoc obj-id))
     g
     obj-coords)))

(defn remove-object
  "Removes object from the game."
  [g obj-id]
  (-> g
      (remove-object-coords obj-id)
      (update-in [:objects] dissoc obj-id)
      (cmd/add-command (cmd/remove-obj obj-id))))


(defn get-fills-in-cell
  "Returns a set of fills of all objects in the given coordinate."
  [g coord]
  (set (map :fill
            (vals (get-in g [:board coord])))))

(defn can-add-fill?
  "Checks if the new fill can be added to a set of existing fills."
  [new-fill fills]
  (case new-fill
    :unit (empty? (set/intersection fills #{:solid :unit}))
    :bridge (= fills #{:water})
    (empty? fills)))

(defn valid-coord?
  "Checks if the given coord exists on the board of the game."
  [g coord]
  (get-in g [:board coord]))

(defn can-add-coordinate?
  [g [coord params]]
  (and (valid-coord? g coord)
       (can-add-fill? (params :fill) (get-fills-in-cell g coord))))

(defn can-place-object?
  [g obj]
  (let [coords (get-object-coords-map obj)]
    (every? #(can-add-coordinate? g %) coords)))

(defn assert-can-place-object
  [g obj]
  (assert (can-place-object? g obj)
          (str "Object " obj " cannot be placed on the board"))
  g)

(defn add-object
  "Adds the given object to the game with the given id."
  [g obj-id obj]
  (-> g
      (assert-can-place-object obj)
      (assoc-in [:objects obj-id] obj)
      (place-object-on-board obj-id)))

(defn set-default-previous-position
  "Sets :previous-position in obj to look in the direction of the board centre.
  This is done for the aesthetical purposes for turning the object in the UI."
  [g obj]
  (let [[mid-x mid-y] (:middle-coord g)
        [pos-x pos-y] (:position obj)
        prev-x (if (< pos-x mid-x) (dec pos-x) (inc pos-x))
        prev-y (if (< pos-y mid-y) (dec pos-y) (inc pos-y))]
    (assoc obj :previous-position [prev-x prev-y])))

(defn add-new-object
  "Adds a new object to the game.
  Assumes that the placement is valid."
  ([g obj position]
   (add-new-object g nil obj position nil nil))
  ([g obj position flip rotation]
   (add-new-object g nil obj position flip rotation))
  ([g p obj position]
   (add-new-object g p obj position nil nil))
  ([g p obj position flip rotation]
   (let [new-obj (as-> obj $
                   (if p (assoc $ :player p) $)
                   (set-object-placement $ position flip rotation)
                   (if (contains? $ :previous-position)
                     (set-default-previous-position g $)
                     $))
         new-obj-id (inc (g :last-added-object-id))]
     (-> g
         (add-object new-obj-id new-obj)
         (assoc :last-added-object-id new-obj-id)
         (cmd/add-command (cmd/add-obj new-obj-id new-obj))))))

(defn on-water?
  "Checks if object stands on water with at least one cell."
  [g obj]
  (let [cells (keys (get-object-coords-map obj))]
    (some #(and (:water %) (not (:bridge %)))
          (map #(get-fills-in-cell g %) cells))))

(defn destruction-reward
  "Give playe p reward for destroying object."
  [g obj-id p]
  (let [reward (get-in g [:objects obj-id :reward])]
    (if reward
      (-> g
          (update-in [:players p :gold] + reward)
          (cmd/add-command (cmd/change-gold p reward obj-id)))
      g)))


(defn destroy-obj
  "Destroys an object, p is a player who destroyed it."
  [g p obj-id]
  (-> g
      (handle obj-id :before-destruction)
      (destruction-reward obj-id p)
      (cmd/add-command (cmd/destroy-obj obj-id))
      (remove-object obj-id)))

(defn drown-object
  [g p obj-id]
  (-> g
      (cmd/add-command (cmd/drown-obj obj-id))
      (destroy-obj p obj-id)))

(defn shall-drown?
  "Checks if the object will drown if placed on board."
  [g obj]
  (and (on-water? g obj)
       (not (or (:waterwalking obj) (:flying obj)))))

(defn drown-if-needed
  [g p obj-id]
  (let [obj (get-in g [:objects obj-id])]
    (if (shall-drown? g obj)
      (drown-object g p obj-id)
      g)))

(defn can-move-object?
  "Checks if the object can be moved to the given position."
  ([g obj-id position] (can-move-object? g obj-id position nil nil))
  ([g obj-id position flip rotation]
   (let [obj (get-in g [:objects obj-id])
         moved-obj (set-object-placement obj position flip rotation)]
     (can-place-object?
      (remove-object-coords g obj-id)
      moved-obj))))

(defn move-object-on-board
  "Moves an object to a new place on board.
  Does not run handlers or add commands, just moves."
  [g obj-id position flip rotation]
  (let [obj (get-in g [:objects obj-id])
        prev-position (:position obj)
        moved-obj (-> obj
                      (set-object-placement position flip rotation)
                      (assoc :previous-position prev-position))]
    (-> g
        (remove-object-coords obj-id)
        (assert-can-place-object moved-obj)
        (assoc-in [:objects obj-id] moved-obj)
        (place-object-on-board obj-id))))

(defn move-object
  "Moves object to the given position.
  Assumes that it is a valid move.
  Adds move command, runs after-move handlers."
  ([g p obj-id position] (move-object g p obj-id position nil nil))
  ([g p obj-id position flip rotation]
   (let [old-obj (get-in g [:objects obj-id])
         g-moved (move-object-on-board g obj-id position flip rotation)
         new-obj (get-in g-moved [:objects obj-id])]
     (-> g-moved
         (cmd/add-command (cmd/move-obj obj-id new-obj old-obj))
         (handle obj-id :after-moved
                 (:position old-obj) position
                 (:flip old-obj) flip
                 (:rotation old-obj) rotation)
         (drown-if-needed p obj-id)))))

(defn get-objects
  "Returns map id->object for all objects that satisfy pred."
  [g pred]
  (into {} (filter #(-> % val pred) (g :objects))))

(defn update-object
  "Performs function f on object and optionally adds a command created by cmd-f.
  Function cmd-f should have signature [obj-id obj-new]."
  ([g obj-id f] (update-object g obj-id f nil))
  ([g obj-id f cmd-f]
   (let [obj (get-in g [:objects obj-id])
         updated-obj (f obj)]
     (if (not= obj updated-obj)
       (as-> g game
         (assoc-in game [:objects obj-id] updated-obj)
         (if cmd-f
           (cmd/add-command game (cmd-f obj-id updated-obj))
           game))
       g))))

(defn update-objects
  "Performs function f on every object in the game that satisfies pred.
  For every update also adds a command (cmd-f obj-id obj-new)."
  [g pred f cmd-f]
  (reduce
   (fn [game obj-id]
     (update-object game obj-id f cmd-f))
   g
   (keys (get-objects g pred))))

(defn deactivate-player-objects
  [g p]
  (update-objects g #(obj/belongs-to? p %) obj/deactivate cmd/set-moves))

(defn set-active-players
  "Sets turn to players ps and activates all their objects."
  [g ps]
  (let [belongs-to-ps? #(ps (:player %))]
    (-> g
        (assoc :active-players ps)
        (update-objects belongs-to-ps? obj/activate cmd/set-moves)
        ;; TODO income, building effects etc.
        (cmd/add-command (cmd/set-active-players ps)))))

(defn get-next-players
  "Returns set of players whose turn is after given players."
  [g ps]
  (let [players-pos (.indexOf (g :turn-order) ps)
        next-pos (mod (inc players-pos) (count (g :turn-order)))]
    (assert (>= players-pos 0))
    (get-in g [:turn-order next-pos])))

(defn switch-turn
  [g]
  (let [ps (g :active-players)
        next-ps (get-next-players g ps)]
    (set-active-players g next-ps)))

(defn has-active-objects?
  [g p]
  (seq
   (get-objects g #(and (obj/belongs-to? p %) (obj/active? %)))))

(defn filled-cell?
  [[_coord properties]]
  (not (#{:floor :bridge :water} (properties :fill))))


(defn all-filled-coord-pairs
  "Gets carthesian product of all filled coordinates of two objects."
  [obj1 obj2]
  (let [coords1 (keys (filter filled-cell? (get-object-coords-map obj1)))
        coords2 (keys (filter filled-cell? (get-object-coords-map obj2)))]
    (for [c1 coords1 c2 coords2]
      [c1 c2])))


(defn obj-distance
  "Returns minimal distance between two objects.
  Counts only filled cells."
  [obj1 obj2]
  (apply min
         (map #(apply distance %) (all-filled-coord-pairs obj1 obj2))))


(defn get-object-id-at
  "Gets id of the filling object at a given coordinate."
  [g coord]
  (let [obj-ids (keys (filter filled-cell? (get-in g [:board coord])))]
    (assert (<= 0 (count obj-ids) 1))
    (first obj-ids)))

(defn get-object-at
  "Gets object at a given coordinate."
  [g coord]
  (let [obj-id (get-object-id-at g coord)]
    (get-in g [:objects obj-id])))

(defn player-lost
  [g p]
  (-> g
      (cmd/add-command (cmd/player-lost p))
      (assoc-in [:players p :status] :lost)))

(defn player-won
  [g p]
  (-> g
      (cmd/add-command (cmd/player-won p))
      (assoc-in [:players p :status] :won)))

(defn remove-obj-shield
  "Decreases object shields by one."
  [g obj-id]
  (update-object g obj-id obj/remove-shield cmd/set-shield))

(defn damage-obj
  "Deals damage to an object or removes shield."
  [g p obj-id damage]
  (if ((fnil pos? 0) (get-in g [:objects obj-id :shield]))
    (remove-obj-shield g obj-id)
    (let [health (get-in g [:objects obj-id :health])
          health-after (- health damage)]
      (if (pos? health-after)
        (update-object g obj-id #(obj/set-health % health-after) cmd/set-health)
        (destroy-obj g p obj-id)))))

(defn end-game
  "Marks game as over."
  [g]
  (-> g
      (assoc :status :over)
      (cmd/add-command (cmd/game-over))))


(defn add-experience
  "Adds experience to the object."
  [g obj-id experience]
  (update-object g obj-id
                 #(obj/add-experience % experience) cmd/set-experience))


(defn clean-command
  "Removes action-id to avoid giving hints to client."
  [cmd]
  (dissoc cmd :action-id))

(defn clean-game
  "Removes information not relevant for the client"
  [g]
  (-> g
      (dissoc
       :last-added-npc
       :last-added-object-id
       :actions)
      (update :commands #(mapv clean-command %))))

(defn get-state-for-player
  [g _p]
  (clean-game g))

(defn player-active?
  "Checks that the player is active and has active objects."
  [g p]
  (and (contains? (:active-players g) p)
       (has-active-objects? g p)))
