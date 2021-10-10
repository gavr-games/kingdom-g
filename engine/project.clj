(defproject engine "0.1.0-SNAPSHOT"
  :description "Game engine"
  :url "https://gavr.games"
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [com.novemberain/langohr "5.1.0"]
                 [cheshire "5.9.0"]
                 [com.taoensso/carmine "2.19.1"]]
  :main ^:skip-aot server.core
  :source-paths ["src"]
  :test-paths ["test"]
  :target-path "target/%s"

  :profiles {:uberjar {:aot :all}
             :js-library {
                          :dependencies [[org.clojure/clojurescript "1.10.520"]]
                          :plugins [[lein-cljsbuild "1.1.7"]
                                    [lein-doo "0.1.11"]]

                          :cljsbuild {
                                      :builds {:compile {:source-paths ["src"]
                                                         :compiler {:output-to
                                                                    "resources/engine.js"
                                                                    :optimizations :advanced}}
                                               :js-test {:source-paths ["src" "test"]
                                                         :compiler {:output-to "out/tests.js"
                                                                    :main client.testrunner
                                                                    :optimizations :whitespace}}}}
                          :doo {:build "js-test"
                                :alias {:default [:nashorn]}}}})
