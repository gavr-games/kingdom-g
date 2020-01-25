(ns server.core
  (:gen-class))


(defn -main
  [& args]
  (println "Started game engine server")
  (println "TODO connect to rabbitmq and subscribe to game management queue")
  (while true
    (Thread/sleep 60000)))
