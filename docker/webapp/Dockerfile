FROM node:16


# Copies package.json and lock file to docker container
# These are not included in the app's components COPY command below
COPY package.json ./fractal-webapp/package.json
COPY package-lock.json ./fractal-webapp/package-lock.json

# Copies app components to docker container directory
COPY . ./fractal-webapp

# Copies the webapp.env and renames to .env.local
# This is to set the local provider url and chain id
COPY docker/webapp/webapp.env ./fractal-webapp/.env.local

# Copies the exec file to bin
COPY docker/webapp/entrypoint.sh /usr/local/bin

WORKDIR /fractal-webapp/

RUN npm install

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]