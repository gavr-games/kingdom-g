#!/usr/bin/env bash

lein with-profile js-library cljsbuild once compile
lein run
