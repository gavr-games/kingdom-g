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
   :object_id obj-id
   :object_edn (prn-str obj)})

(defn remove-obj
  [obj-id]
  {:command :remove-object :object_id obj-id})

(defn destroy-obj
  [obj-id]
  {:command :destroy-object :object_id obj-id})

(defn drown-obj
  [obj-id]
  {:command :drown-object :object_id obj-id})

(defn move-obj
  [obj-id old-obj new-obj]
  (cond-> {:command :move-object
           :object_id obj-id
           :position (:position new-obj)}
    (not= (:rotation old-obj)
          (:rotation new-obj)) (assoc :rotation (:rotation new-obj))
    (not= (:flip old-obj)
          (:flip new-obj)) (assoc :flip (:flip new-obj))))

(defn set-moves
  ([obj-id old-obj obj] (set-moves obj-id obj))
  ([obj-id obj]
   {:command :set-moves :object_id obj-id :moves (obj :moves)}))

(defn set-health
  ([obj-id old-obj obj] (set-health obj-id obj))
  ([obj-id obj]
   {:command :set-health :object_id obj-id :health (obj :health)}))

(defn set-experience
  ([obj-id old-obj obj] (set-experience obj-id obj))
  ([obj-id obj]
   {:command :set-experience :object_id obj-id :experience (obj :experience)}))

(defn set-level
  ([obj-id old-obj obj] (set-level obj-id obj))
  ([obj-id obj]
   {:command :set-level :object_id obj-id :level (obj :level)}))

(defn set-active-players
  [ps]
  {:command :set-active-players :players (vec ps)})

(defn end-turn
  [p]
  {:command :end-turn :player p})

(defn change-gold
  "Change player's gold by given amount.
  If obj-id is given, it indicates reward for destroying this object."
  ([p amount] (change-gold p amount nil))
  ([p amount obj-id]
   (cond-> {:command :change-gold :player p :amount amount}
     obj-id (assoc :object_id obj-id))))

(defn attack
  [obj-id target-id params]
  {:command :attack :attacker_id obj-id :target_id target-id :params params})

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
  {:command :binds :object_id obj-id :target_id target-id})

(defn unbinds
  [obj-id target-id]
  {:command :unbinds :object_id obj-id :target_id target-id})

(defn set-shield
  ([obj-id old-obj obj] (set-shield obj-id obj))
  ([obj-id obj]
   {:command :set-shield :object_id obj-id :shield (obj :shield)}))

(defn set-max-moves
  ([obj-id old-obj obj] (set-max-moves obj-id obj))
  ([obj-id obj]
   {:command :set-max-moves :object_id obj-id :max-moves (obj :max-moves)}))

(defn set-max-health
  ([obj-id old-obj obj] (set-max-health obj-id obj))
  ([obj-id obj]
   {:command :set-max-health :object_id obj-id :max-health (obj :max-health)}))

(defn set-attack
  ([obj-id old-obj obj] (set-attack obj-id obj))
  ([obj-id obj]
   {:command :set-attack :object_id obj-id :attack (obj :attack)}))

;;;; Every command that changes game state should have a corresponding runner
