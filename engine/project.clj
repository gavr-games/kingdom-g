(defproject engine "0.1.0-SNAPSHOT"
  :description "Game engine"
  :url "https://gavr.games"
  :dependencies [[org.clojure/clojure "1.10.0"]]
  :main ^:skip-aot server.core
  :source-paths ["src/clojure"]
  :java-source-paths ["src/java"]
  :test-paths ["test/clojure"]
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
