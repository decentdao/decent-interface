FROM node:16-alpine

# Copies the .env.local and renames
# The renaming happens because `.env.local` is git ignored
COPY ./.env.local /fractal-blockchain-node/.env

# Copies a hardhat.package.json and renames
COPY ./hardhat.package.json /fractal-blockchain-node/package.json 

# Copies a hardhat.config.js and renames
COPY ./hardhat.config.js /fractal-blockchain-node/hardhat.config.js

# Copies the exec file to bin
COPY ./entrypoint.sh /usr/local/bin

WORKDIR /fractal-blockchain-node/

# install needed dependencies
# These dependencies are needed so that the the node will run correctly
# --no-cache and --virtual flags added to speed build time
# caching isn't needed since this will be rebuild and ran fresh each time a test is ran
RUN apk --no-cache --virtual build-dependencies add python3 make g++

RUN npm install

# keeps server running
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
