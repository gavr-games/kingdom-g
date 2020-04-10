(ns engine.pathfinding
  (:require [engine.checks :as check]
            [engine.core :as core :refer [can-move-object?]]
            [engine.transformations :refer [distance difference]]))

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

(defn- m-dist
  "Returns manhattan distance between coords (not allowing diagonals)."
  [c1 c2]
  (reduce + (map difference c1 c2)))

(defn a-star
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
        valid-pos? #(core/can-move-object-without-drowning? g obj-id %)
        pos (:position obj)
        initial-path [(distance pos destination) 0 [pos]]]
    (loop [paths (sorted-set initial-path)
           visited #{}]
      (if (seq paths)
        (let [[estimate straight-moves path] (first paths)
              rest-paths (disj paths (first paths))
              cur-pos (last path)
              steps-made (dec (count path))]
          (if (<= estimate moves)
            (if (reachable? cur-pos)
              (rest (conj path destination))
              (let [new-visited (conj visited cur-pos)
                    n->p (fn [n]
                           [(+ steps-made 1 (calc-estimate n))
                            (+ straight-moves (m-dist cur-pos n))
                            (conj path n)])
                    ns (->> (neighbours cur-pos)
                            (remove visited)
                            (filter valid-pos?))
                    added-paths (map n->p ns)
                    new-paths (apply conj rest-paths added-paths)]
                (recur new-paths new-visited)))))))))

(defn find-path
  "Searches for a path for the object with the given id to the given destination.
  The object should have enough moves to reach the destination.
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

      (and (:flying obj)
           (not (:chess-knight obj))) (if (can-move-object? g obj-id destination)
                                        [destination])

      :else (a-star g obj-id destination))))
