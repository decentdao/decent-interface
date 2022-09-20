FROM node:16-alpine

# Copy a hardhat.package.json -> docker | root:package.json
COPY ./hardhat.package.json package.json 

# Copy a hardhat.config.js -> docker | root:hardhat.config.local.js
COPY ./hardhat.config.js hardhat.config.js

COPY ./entrypoint.sh /usr/local/bin

WORKDIR /usr/src/fractal-test

# install git
RUN apk --no-cache --virtual build-dependencies add python3 make g++ git

RUN npm install

# keeps server running
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]



# Clone contracts repos to a contract repo directory
# 
## 

# install 
# create directory
