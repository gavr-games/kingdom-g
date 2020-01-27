(ns server.core
  (:gen-class)
  (:require [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]))

(def ^{:const true}
  default-exchange-name "")

(def ^{:const true}
  management-q-name "game.management")

(defn management-handler
  [ch {:keys [delivery-tag] :as meta} ^bytes payload]
  (println "Received a message: " (String. payload "UTF-8") meta)
  (lb/ack ch delivery-tag))


(defn -main
  [& args]
  (println "Game engine server starting"
           (.toString (java.time.LocalDateTime/now)))
  (let [conn (rmq/connect {:uri (System/getenv "RABBITMQ_URL")})
        ch (lch/open conn)]
    (println "Connected to RabbitMQ. Channel id: " (.getChannelNumber ch))
    (lq/declare ch management-q-name {:auto-delete false})
    (lc/subscribe ch management-q-name management-handler)

    (while true
      (Thread/sleep 60000))))
