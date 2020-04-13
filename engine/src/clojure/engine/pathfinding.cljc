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
    (and
     (core/can-add-fill? fill fills))))
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
                  (recur new-paths new-visited))))
            (recur rest-paths new-visited)))))))

(defn bfs-build-path
  [prevs destination]
  (loop [p [destination]]
    (let [cur (last p)
          prev (prevs cur)]
      (if (= :start (prevs prev))
        (reverse p)
        (recur (conj p prev))))))

(defn bfs
  [g obj-id destination]
  (let [obj (get-in g [:objects obj-id])
        neighbours (if (:chess-knight obj)
                     neighbours-knight
                     neighbours-normal)
        reachable? (if (:chess-knight obj)
                     #(check/chess-knight-reachable? % destination)
                     #(check/one-step-reachable? % destination))
        moves (:moves obj)
        valid-pos? (get-valid-pos-fn g obj-id)
        pos (:position obj)]
    (loop [q [[pos 0]]
           prevs {pos :start}]
      (if (seq q)
        (let [[cur-pos steps] (first q)]
          (if (valid-pos? cur-pos)
            (if (< steps moves)
              (if (reachable? cur-pos)
                (bfs-build-path (assoc prevs destination cur-pos) destination)
                (let [neibs (filter #(core/valid-coord? g %)
                                    (remove prevs (neighbours cur-pos)))
                      new-prevs (reduce #(assoc %1 %2 cur-pos) prevs neibs)
                      new-q (reduce #(conj %1 [%2 (inc steps)])
                                    (subvec q 1) neibs)]
                  (recur new-q new-prevs))))
            (recur (subvec q 1) prevs)))))))

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

      :else (bfs g obj-id destination))))
