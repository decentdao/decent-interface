#!/bin/bash

# A script to facilitate booting Docker and the Fractal containers if they are not already running before running Playwright tests.
# Usage:
#   `source test.sh` - to run all Playwright tests, for all browsers
#   `source test.sh tests/{path to test}` - to run a specific test, for all browsers
#
# Please follow setup instructions in README.md under "Testing - Playwright" prior to using this script.

# Step 1: Open Docker, only if it is not already running
if (! docker stats --no-stream &>/dev/null )
then
  open -gja Docker &>/dev/null; # open Mac OS Docker app
  echo "Waiting for Docker to start...";
  while (! docker stats --no-stream &>/dev/null) # keep checking until it's fully started
  do
    sleep 5;
  done
  echo "Docker is running!";
fi

# Step 2: if the Fractal containers aren't running, start those as well
currentHash=`git rev-parse HEAD`;
if [ -z `docker ps -q --no-trunc | grep $(docker-compose ps -q blockchain)` ]
then
  docker compose up --build &>/dev/null & disown;
  echo "Waiting for Fractal containers..."
  while [ -z `docker ps -q --no-trunc | grep $(docker-compose ps -q blockchain)` ]
  do
    sleep 5;
  done
  sleep 60; # TODO containers take almost a full minute after they're up before they're ready ¯\_(ツ)_/¯
  echo "Fractal containers are running!";
elif [ "$PLAYWRIGHT_TEST_HASH" != "$currentHash" ]
then
  # if our git hash has changed, rebuild the containers so we're not testing on an old app version 
  echo "Rebuilding containers...";
  docker compose build &>/dev/null;
  echo "Containers are rebuilt!";
fi
export PLAYWRIGHT_TEST_HASH=`git rev-parse HEAD`;

# Step 3: run tests, either with the given file, or all of them if the parameter is empty
npx playwright test $1;