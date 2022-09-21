FROM node:16-alpine

# Copy a hardhat.package.json -> docker | root:package.json
COPY ./hardhat.package.json /fractal-blockchain-node/package.json 

# Copy a hardhat.config.js -> docker | root:hardhat.config.local.js
COPY ./hardhat.config.js /fractal-blockchain-node/hardhat.config.js

COPY ./.env.local /fractal-blockchain-node/.env

COPY ./entrypoint.sh /usr/local/bin

WORKDIR /fractal-blockchain-node/

# install needed dependencies
RUN apk --no-cache --virtual build-dependencies add python3 make g++

RUN npm install

# keeps server running
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]



# Clone contracts repos to a contract repo directory
# 
## 

# install 
# create directory
