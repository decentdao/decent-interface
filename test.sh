#!/bin/bash

# A script to facilitate booting Docker if it's not already running before running Playwright tests.
# Usage:
#   ./test.sh - to run all Playwright tests
#   ./test.sh tests/{testfile} - to run a specific test, for all browsers

# Open Docker, only if it is not already running
# adapted from https://stackoverflow.com/a/48843074
if (! docker stats --no-stream ); then
  # open Mac OS Docker app
  open /Applications/Docker.app &>/dev/null & disown;

  echo "Waiting for Docker to launch..."
  while (! docker stats --no-stream ); do
    echo "Waiting for Docker to start..."
    sleep 5
  done
  echo "Docker is running!"
fi

# if the Fractal containers aren't running, start those as well (in the background)
if [ -z `docker ps -q --no-trunc | grep $(docker-compose ps -q blockchain)` ]; then
  echo "Running Fractal Docker containers."
  docker compose up --build &>/dev/null & disown;

  # wait for Fractal Docker containers to finish loading before proceeding with the tests
  while [ -z `docker ps -q --no-trunc | grep $(docker-compose ps -q blockchain)` ]; do
    echo "Waiting for containers..."
    sleep 5
  done
  echo "Fractal containers are running!"
fi

if [ $# -eq 0 ]
then
    echo "Running all tests!"
    npx playwright test
else
    echo "Running " $1
    npx playwright test $1
fi