(ns engine.pathfinding)

(defn find-path
  "Searches for a path for the object with the given id to the given destination.
  The object should have enough moves to reach the destination.
  Destination can be free or occupied. If it is occupied, looks for a path with
  the last step stepping on the destination.
  If path exists, returns a sequence of positions leading to the destination,
  otherwise returns nil."
  [g obj-id destination]

;  if within one step - ok
;  if out of reach by distance - nil
;  if flying & not occupied - check
;  if flying and occupied - nil
;  test with A*
  )
