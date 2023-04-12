FROM node:18.12.1

# Copies package-lock.json file to docker container
# This file is are not included in the app's components COPY command below
COPY package-lock.json ./fractal-webapp/package-lock.json

# Copies app components to docker container directory
COPY . ./fractal-webapp

# Copies the exec file to bin
COPY ./docker/webapp/entrypoint.sh /usr/local/bin

WORKDIR /fractal-webapp/

RUN npm ci

RUN npm run build

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
