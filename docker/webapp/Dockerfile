FROM node:18.12.1

# Set build-time arguments
ARG NEXT_PUBLIC_TESTING_ENVIROMENT
ARG NEXT_PUBLIC_LOCAL_CHAIN_ID
ARG NEXT_PUBLIC_LOCAL_PROVIDER_URL

# Set environment variables
ENV NEXT_PUBLIC_TESTING_ENVIROMENT=$NEXT_PUBLIC_TESTING_ENVIROMENT
ENV NEXT_PUBLIC_LOCAL_CHAIN_ID=$NEXT_PUBLIC_LOCAL_CHAIN_ID
ENV NEXT_PUBLIC_LOCAL_PROVIDER_URL=$NEXT_PUBLIC_LOCAL_PROVIDER_URL

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
