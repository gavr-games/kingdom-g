(ns client.testrunner
  (:require [doo.runner :refer-macros [doo-tests]]
            [engine.abilities-test]
            [engine.actions-test]
            [engine.attack-test]
            [engine.core-test]
            [engine.transformations-test]
            [engine.utils-test]
            [engine.newgame-test]
            [engine.command-runner-test]
            [engine.pathfinding-test]
            [client.api-test]))

(doo-tests 'engine.abilities-test
           'engine.actions-test
           'engine.attack-test
           'engine.core-test
           'engine.transformations-test
           'engine.utils-test
           'engine.newgame-test
           'engine.command-runner-test
           'engine.pathfinding-test
           'client.api-test)
