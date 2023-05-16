# Dockerfile for Fractal Blockchain Node
FROM node:18.12.1-alpine

# Set working directory
WORKDIR /fractal-blockchain-node/

# Copy package.json
COPY ./hardhat.package.json /fractal-blockchain-node/package.json

# Install needed dependencies
# These dependencies are needed so that the node will run correctly
RUN apk --no-cache add python3 make g++ \
    && npm install \
    && apk del python3 make g++

# Copy the rest of the files
COPY ./hardhat.config.js /fractal-blockchain-node/hardhat.config.js
COPY ./entrypoint.sh /usr/local/bin

# Keep server running
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
