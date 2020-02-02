(ns server.core
  (:gen-class)
  (:require [engine.newgame :refer [create-game-shuffled-players]]
            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]
            [cheshire.core     :as json]))

(def games
  "Map of game id to game data."
  (ref {}))

(def ^{:const true}
  default-exchange-name "")

(def ^{:const true}
  management-q-name "game.management")

(defn ex-logging
  "Wraps given function into try-catch which prints exceptions to stderr."
  [f]
  (fn [& args]
    (try
      (apply f args)
      (catch Exception ex
        (.println *err* (str "Uncaught exception on" f ex))))))

(defn clean-players
  "Extracts :id and :team fields from player list."
  [players]
  (map #(select-keys % [:id :team]) players))

(defn process-game-creation
  [ch game-data]
  (let [game-id (:id game-data)
        players (clean-players (:players game-data))
        game (create-game-shuffled-players players)]
    (dosync (alter games assoc game-id game)))
  ; TODO
  )

(defn management-handler
  [ch {:keys [delivery-tag] :as meta} ^bytes payload]
  (lb/ack ch delivery-tag)
  (let [message-str (String. payload "UTF-8")]
    (println "Received a message:" message-str meta)
    (let [message (json/decode message-str true)
          action (:action message)
          data (:body message)]
      (case action
        "create_game" (process-game-creation ch data)
        (println "Unknown action" action))))
  )

(defn start-game-server
  "Starts a server and returns a closeable connection.
  To close the connection (langohr.core/close conn)"
  []
  (Thread/setDefaultUncaughtExceptionHandler
   (reify Thread$UncaughtExceptionHandler
     (uncaughtException [_ thread ex]
       (.println *err* (str "Uncaught exception on" (.getName thread) ex)))))
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
