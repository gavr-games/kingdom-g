(ns server.core
  (:gen-class)
  (:require [engine.newgame :refer [create-game-shuffled-players]]
            [engine.core :as core]
            [engine.actions :as action]
            [engine.abilities] ; To load the namespace and register actions
            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]
            [langohr.exchange  :as le]
            [cheshire.core     :as json]
            [server.persistence :refer [save-games load-games]]))

(def games
  "Map of game id to game data."
  (ref {}))

(def default-exchange-name "")

(def management-q-name "game.management")

(def game-replies-exchange-name "game.replies")

(defn game-actions-q-name
  [game-id]
  (str "game.actions." game-id))

(defn ex-logging
  "Wraps given function into try-catch which prints exceptions to stderr."
  [f]
  (fn [& args]
    (try
      (apply f args)
      (catch Exception ex
        (println ex)))))

(defn clean-players
  "Extracts :id and :team fields from player list."
  [players]
  (map #(select-keys % [:id :team]) players))

(defn act! [g-id p action params]
  (let [action (keyword action)]
    (dosync
     (let [g (@games g-id)
           [g-after result] (action/get-action-result g p action params)]
       (when (:success result)
         (if (= :over (g-after :status))
           (alter games dissoc g-id)
           (alter games assoc g-id g-after)))
       result))))

(defn send-game-message
  [game-id p ch routing-key message request-meta]
  (let [correlation-id (:correlation-id request-meta)
        reply-to (:reply-to request-meta)
        ename (if reply-to
                default-exchange-name
                game-replies-exchange-name)
        reply (assoc message
                     :game_id game-id
                     :player p
                     :reply_type routing-key)
        reply-json (json/encode reply)]
    (lb/publish ch
                ename
                (or reply-to routing-key)
                reply-json
                {:correlation-id correlation-id})))

(defn process-game-action
  [game-id ch action params request-meta]
  (let [p (:p params)
        action-result (act! game-id p action params)
        success (:success action-result)
        routing-key (if success "commands" "error")]
    (send-game-message game-id p ch routing-key action-result request-meta)))

(defn send-game-state
  "Sends a reply with game state."
  [game-id ch p request-meta]
  (let [g (@games game-id)
        g4p (core/get-state-for-player g p)
        reply {:game_state (prn-str g4p)}]
    (send-game-message game-id
                       p
                       ch
                       "game_state"
                       reply
                       request-meta)))

(defn game-action-handler
  [game-id ch message-meta ^bytes payload]
  (lb/ack ch (:delivery-tag message-meta))
  (let [message-str (String. payload "UTF-8")]
    (println "Received a message for game" game-id ":"
             message-str message-meta)
    (let [message (json/decode message-str true)
          action (:action message)
          params (:parameters message)]
      (case action
        "get-game-data" (send-game-state game-id ch (:p params) message-meta)
        (process-game-action game-id ch action params message-meta)))))

(defn create-game-actions-handler
  [ch game-id]
  (let [actions-q-name (game-actions-q-name game-id)]
    (lq/declare ch actions-q-name)
    (lc/subscribe ch actions-q-name
                  (ex-logging (partial game-action-handler game-id)))))

(defn process-game-creation!
  [ch game-data]
  (let [game-id (:id game-data)
        players (clean-players (:players game-data))
        game (create-game-shuffled-players players)]
    (println "Creating game" game-id)
    (dosync (alter games assoc game-id game))
    (create-game-actions-handler ch game-id)))

(defn management-handler
  [ch {:keys [delivery-tag] :as message-meta} ^bytes payload]
  (lb/ack ch delivery-tag)
  (let [message-str (String. payload "UTF-8")]
    (println "Received a message:" message-str message-meta)
    (let [message (json/decode message-str true)
          action (:action message)
          data (:data message)]
      (case action
        "create_game" (process-game-creation! ch data)
        (println "Unknown action" action)))))

(defn stop-game-server
  "Saves games and closes the passed rabbitmq connection."
  [conn]
  (println "Game engine server stopping"
           (str (java.time.LocalDateTime/now)))
  (rmq/close conn)
  (println "Closed RabbitMQ connection")
  (save-games @games)
  (println "Saved games"))

(defn add-shutdown-hook
  [conn]
  (.addShutdownHook
   (Runtime/getRuntime)
   (Thread. ^Runnable #(stop-game-server conn))))

(defn load-games-from-redis
  "Loads games from redis and creates rabbitmq listeners for their actions.
  ch - rabbitmq channel."
  [ch]
  (let [loaded (load-games)]
    (dosync
     (alter games merge loaded))
    (doall (map #(create-game-actions-handler ch %) (keys loaded)))
    (println "Loaded" (count loaded) "games from redis:" (str (keys loaded)))))

(defn start-game-server
  "Starts a server and returns a closeable connection.
  To close the connection (langohr.core/close conn)"
  []
  (Thread/setDefaultUncaughtExceptionHandler
   (reify Thread$UncaughtExceptionHandler
     (uncaughtException [_ _thread ex]
       (println ex))))
  (println "Game engine server starting"
           (str (java.time.LocalDateTime/now)))
  (let [conn (rmq/connect {:uri (System/getenv "RABBITMQ_URL")})
        ch (lch/open conn)]
    (println "Connected to RabbitMQ. Channel id:" (.getChannelNumber ch))
    (load-games-from-redis ch)
    (lq/declare ch management-q-name {:auto-delete false})
    (lc/subscribe ch management-q-name (ex-logging management-handler))
    (le/direct ch game-replies-exchange-name)
    (add-shutdown-hook conn)
    conn))



(defn -main
  [& _args]
  (start-game-server)
  (while true
      (Thread/sleep 60000)))
