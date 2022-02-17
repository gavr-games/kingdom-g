(ns engine.pathfinding
  (:require [engine.checks :as check]
            [engine.core :as core :refer [can-move-object?]]
            [engine.transformations :refer [distance difference mh-distance]]))

(defn theoretically-reachable
  [obj target]
  (let [moves (:moves obj)
        obj-pos (:position obj)]
    (if (:chess-knight obj)
      (let [distances (map difference obj-pos target)
            d-min (apply min distances)
            d-max (apply max distances)]
        (and (<= d-min moves)
             (<= d-max (* moves 2))))
      (<= (distance obj-pos target) moves))))

(defn neighbours-normal
  [[x y]]
  [[(dec x) y] [(inc x) y] [x (dec y)] [x (inc y)]
   [(dec x) (dec y)] [(dec x) (inc y)] [(inc x) (dec y)] [(inc x) (inc y)]])

(defn neighbours-knight
  [[x y]]
  [[(- x 2) (dec y)] [(- x 2) (inc y)] [(+ x 2) (dec y)] [(+ x 2) (inc y)]
   [(dec x) (- y 2)] [(inc x) (- y 2)] [(dec x) (+ y 2)] [(inc x) (+ y 2)]])


(defn can-move-object-without-drowning?
  [g obj-id position]
  (let [obj (get-in g [:objects obj-id])
        moved-obj (core/set-object-placement obj position)]
    (and
     (core/can-move-object? g obj-id position)
     (not (core/shall-drown? g moved-obj)))))


(defn can-add-fill?
  "Quicker check for objects of size 1."
  [g fill position]
  (let [fills (core/get-fills-in-cell g position)]
    (core/can-add-fill? fill fills)))
;; +++++++++++++++++++
(defn can-add-fill-without-drowning?
  "Quicker check for objects of size 1."
  [g fill position]
  (let [fills (core/get-fills-in-cell g position)]
    (and
     (core/can-add-fill? fill fills)
     (or (not (:water fills))
         (:bridge fills)))))

(defn get-valid-pos-fn
  "Returns a function (fn [pos]...) that checks if object can step on position."
  [g obj-id]
  (let [obj (get-in g [:objects obj-id])
        g-no-obj (core/remove-object-coords g obj-id)]
    (if (> (count (:coords obj)) 1)
      #(can-move-object-without-drowning? g obj-id %)
      (let [fill (get-in obj [:coords [0 0] :fill])]
        (if (or (:waterwalking obj) (:flying obj))
          #(can-add-fill? g-no-obj fill %)
          #(can-add-fill-without-drowning? g-no-obj fill %))))))

(defn a-star
  "Turns out to be slower on 20*20 board, using BFS instead."
  [g obj-id destination]
  (let [obj (get-in g [:objects obj-id])
        neighbours (if (:chess-knight obj)
                     neighbours-knight
                     neighbours-normal)
        reachable? (if (:chess-knight obj)
                     #(check/chess-knight-reachable? % destination)
                     #(check/one-step-reachable? % destination))
        calc-estimate #(if (:chess-knight obj)
                         0
                         (distance % destination))
        moves (:moves obj)
        valid-pos? (get-valid-pos-fn g obj-id)
        pos (:position obj)
        initial-path [(distance pos destination) 0 [pos]]]
    (loop [paths (sorted-set initial-path)
           visited #{}]
      (if (seq paths)
        (let [[estimate straight-moves path] (first paths)
              rest-paths (disj paths (first paths))
              cur-pos (last path)
              new-visited (conj visited cur-pos)
              steps-made (dec (count path))]
          (if (valid-pos? cur-pos)
            (if (<= estimate moves)
              (if (reachable? cur-pos)
                (rest (conj path destination))
                (let [n->p (fn [n]
                             [(+ steps-made 1 (calc-estimate n))
                              (+ straight-moves (mh-distance cur-pos n))
                              (conj path n)])
                      ns (->> (neighbours cur-pos)
                              (remove visited)
                              (filter #(core/valid-coord? g %)))
                      added-paths (map n->p ns)
                      new-paths (apply conj rest-paths added-paths)]
                  (recur new-paths new-visited)))
              nil)
            (recur rest-paths new-visited)))
        nil))))

(defn bfs-build-path
  [prevs destination]
  (loop [p [destination]]
    (let [cur (peek p)
          prev (prevs cur)]
      (if (= :start (prevs prev))
        (vec (reverse p))
        (recur (conj p prev))))))

(defn bfs
  "Traverses all positions object can reach with its moves.
   For every reachable destination (including initial position)
   runs (f-destination? pos steps-to-pos), and if it is true,
   returns [path-to-position nil].
   Otherwise returns [nil all-reachable-positions].
   all-reachable-positions is a dictionary {pos prev-pos ... init-pos :start}."
  [g obj-id f-destination?]
  (let [obj (get-in g [:objects obj-id])
        neighbours (if (:chess-knight obj)
                     neighbours-knight
                     neighbours-normal)
        moves (:moves obj)
        valid-pos? (get-valid-pos-fn g obj-id)
        pos (:position obj)]
    (loop [q [[pos 0]]
           prevs {pos :start}]
      (if (seq q)
        (let [[cur-pos steps] (first q)]
          (if (valid-pos? cur-pos)
            (if (<= steps moves)
              (if (f-destination? cur-pos steps)
                [(bfs-build-path prevs cur-pos) nil]
                (let [neibs (filter #(core/valid-coord? g %)
                                    (remove prevs (neighbours cur-pos)))
                      new-prevs (reduce #(assoc %1 %2 cur-pos) prevs neibs)
                      new-q (reduce #(conj %1 [%2 (inc steps)])
                                    (subvec q 1) neibs)]
                  (recur new-q new-prevs)))
              [nil prevs])
            (recur (subvec q 1) prevs)))
        [nil prevs]))))

(defn bfs-for-client
  "Pathfinding supposed to be used in find-path for client.
   Destination can be a "
  [g obj-id destination]
  (let [obj (get-in g [:objects obj-id])
        reachable? (if (:chess-knight obj)
                     #(check/chess-knight-reachable? % destination)
                     #(check/one-step-reachable? % destination))
        before-destination? (fn [pos dist] (and (< dist (:moves obj))
                                                (reachable? pos)))
        [path _] (bfs g obj-id before-destination?)]
    (if path
      (conj path destination)
      nil)))


(defn find-path
  "Searches for a path for the object with given id to the given destination.
  The object should have enough moves to reach the destination.
  If the object is already at the destination, returns nil.
  Destination can be free or occupied. If it is occupied, looks for a path with
  the last step stepping on the destination.
  If path exists, returns a sequence of positions leading to the destination,
  otherwise returns nil."
  [g obj-id destination]
  (let [obj (get-in g [:objects obj-id])
        moves (:moves obj)]
    (cond
      (<= moves 0) nil

      (nil? (check/coord-one-step-away obj destination)) [destination]

      (not (theoretically-reachable obj destination)) nil

      (= (:position obj) destination) nil

      (and (:flying obj)
           (not (:chess-knight obj))) (if (can-move-object? g obj-id destination)
                                        [destination]
                                        nil)

      :else (bfs-for-client g obj-id destination))))
