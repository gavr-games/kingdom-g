(ns engine.commands)

(defn add-command
  "Appends a new command to the list of commands."
  [g cmd]
  (let [action-id (-> g :actions count dec)
        cmd-with-action (assoc cmd :action-id action-id)]
    (update-in g [:commands] conj cmd-with-action)))

(defn add-obj
  [obj-id obj]
  {:command :add-object
   :object-id obj-id
   :object-edn (prn-str obj)})

(defn remove-obj
  [obj-id]
  {:command :remove-object :object-id obj-id})

(defn destroy-obj
  [obj-id]
  {:command :destroy-object :object-id obj-id})

(defn drown-obj
  [obj-id]
  {:command :drown-object :object-id obj-id})

(defn move-obj
  [obj-id old-obj new-obj]
  (cond-> {:command :move-object
           :object-id obj-id
           :position (:position new-obj)}
    (not= (:rotation old-obj)
          (:rotation new-obj)) (assoc :rotation (:rotation new-obj))
    (not= (:flip old-obj)
          (:flip new-obj)) (assoc :flip (:flip new-obj))))

(defn set-moves
  ([obj-id old-obj obj] (set-moves obj-id obj))
  ([obj-id obj]
   {:command :set-moves :object-id obj-id :moves (obj :moves)}))

(defn set-health
  ([obj-id old-obj obj] (set-health obj-id obj))
  ([obj-id obj]
   {:command :set-health :object-id obj-id :health (obj :health)}))

(defn set-experience
  ([obj-id old-obj obj] (set-experience obj-id obj))
  ([obj-id obj]
   {:command :set-experience :object-id obj-id :experience (obj :experience)}))

(defn set-active-player
  [p]
  {:command :set-active-player :player p})

(defn end-turn
  [p]
  {:command :end-turn :player p})

(defn change-gold
  "Change player's gold by given amount.
  If obj-id is given, it indicates reward for destroying this object."
  ([p amount] (change-gold p amount nil))
  ([p amount obj-id]
   (cond-> {:command :change-gold :player p :amount amount}
     obj-id (assoc :object-id obj-id))))

(defn attack
  [obj-id target-id params]
  {:command :attack :attacker obj-id :target target-id :params params})

(defn player-lost
  [p]
  {:command :player-lost :player p})

(defn player-won
  [p]
  {:command :player-won :player p})

(defn game-over
  []
  {:command :game-over})

(defn binds
  [obj-id target-id]
  {:command :binds :object-id obj-id :target target-id})

(defn unbinds
  [obj-id target-id]
  {:command :unbinds :object-id obj-id :target target-id})




;;;; Every command that changes game state should have a corresponding runner
