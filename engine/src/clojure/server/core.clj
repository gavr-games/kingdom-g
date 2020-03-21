(ns server.core
  (:gen-class)
  (:require [engine.newgame :refer [create-game-shuffled-players]]
            [engine.actions :as action]
            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]
            [langohr.exchange  :as le]
            [cheshire.core     :as json]))

(def games
  "Map of game id to game data."
  (ref {}))

(def default-exchange-name "")

(def management-q-name "game.management")

(defn game-actions-q-name
  [game-id]
  (str "game.actions." game-id))

(defn game-commands-exchange-name
  [game-id]
  (str "game.commands." game-id))

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
           action-result (action/act g p action params)]
       (if (keyword? action-result)
         {:success false :error action-result}
         (let [g-after action-result
               new-commands (subvec (g-after :commands) (count (g :commands)))
               over (= :over (g-after :status))]
           (if over
             (alter games dissoc g-id)
             (alter games assoc g-id g-after))
           {:success true :commands new-commands}))))))

(defn send-game-message
  [game-id ch routing-key message]
  (let [ename (game-commands-exchange-name game-id)
        message-json (json/encode message)]
    (lb/publish ch ename routing-key message-json)))

(defn process-game-action
  [game-id ch action params]
  (let [p (:p params)
        action-result (act! game-id p action params)
        success (:success action-result)
        routing-key (if success "commands" "reply")]
    (send-game-message game-id ch routing-key action-result)))

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
        "get-game-data" (send-game-message game-id ch "reply" "{\"Not-implemented-yet\":0}")
        (process-game-action game-id ch action params)))))

(defn create-game-actions-handler
  [ch game-id]
  (let [actions-q-name (game-actions-q-name game-id)]
    (lq/declare ch actions-q-name)
    (lc/subscribe ch actions-q-name
                  (ex-logging (partial game-action-handler game-id)))))

(defn create-game-commands-exchange
  [ch game-id]
  (le/direct ch (game-commands-exchange-name game-id)))

(defn process-game-creation!
  [ch game-data]
  (let [game-id (:id game-data)
        players (clean-players (:players game-data))
        game (create-game-shuffled-players players)]
    (dosync (alter games assoc game-id game))
    (create-game-commands-exchange ch game-id)
    (create-game-actions-handler ch game-id)))

(defn management-handler
  [ch {:keys [delivery-tag] :as message-meta} ^bytes payload]
  (lb/ack ch delivery-tag)
  (let [message-str (String. payload "UTF-8")]
    (println "Received a message:" message-str message-meta)
    (let [message (json/decode message-str true)
          action (:action message)
          data (:body message)]
      (case action
        "create_game" (process-game-creation! ch data)
        (println "Unknown action" action)))))

(defn start-game-server
  "Starts a server and returns a closeable connection.
  To close the connection (langohr.core/close conn)"
  []
  (Thread/setDefaultUncaughtExceptionHandler
   (reify Thread$UncaughtExceptionHandler
     (uncaughtException [_ thread ex]
       (println ex))))
  (println "Game engine server starting"
           (.toString (java.time.LocalDateTime/now)))
  (let [conn (rmq/connect {:uri (System/getenv "RABBITMQ_URL")})
        ch (lch/open conn)]
    (println "Connected to RabbitMQ. Channel id:" (.getChannelNumber ch))
    (lq/declare ch management-q-name {:auto-delete false})
    (lc/subscribe ch management-q-name (ex-logging management-handler))
    conn))

(defn -main
  [& args]
  (start-game-server)
  (while true
      (Thread/sleep 60000)))
