#!/bin/bash

# A script to facilitate booting Docker if it's not already running before running Playwright tests.
# Usage:
#   ./test.sh - to run all Playwright tests
#   ./test.sh tests/{testfile} - to run a specific test, for all browsers

# Open Docker, only if it is not already running
# adapted from https://stackoverflow.com/a/48843074
if (! docker stats --no-stream ); then
  # open Mac OS Docker app
  open /Applications/Docker.app

echo "Waiting for Docker to launch..."
while (! docker stats --no-stream ); do
  # Docker takes a few seconds to initialize
  sleep 1
done
fi
echo "Docker is running!"

if [ $# -eq 0 ]
then
    echo "Running all tests!"
    npx playwright test
else
    echo "Running " $1
    npx playwright test $1
fi