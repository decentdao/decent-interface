# Base stage for dependencies
FROM node:18.12.1 AS base

WORKDIR /fractal-webapp/

COPY package-lock.json .
COPY package.json .

RUN npm ci

# Build stage for Next.js app
FROM base AS build

COPY . .

RUN npm run build

# Final stage for production
FROM node:18.12.1 AS production

# Set build-time arguments
ARG NEXT_PUBLIC_TESTING_ENVIROMENT
ARG NEXT_PUBLIC_LOCAL_CHAIN_ID
ARG NEXT_PUBLIC_LOCAL_PROVIDER_URL

# Set environment variables
ENV NEXT_PUBLIC_TESTING_ENVIROMENT=$NEXT_PUBLIC_TESTING_ENVIROMENT
ENV NEXT_PUBLIC_LOCAL_CHAIN_ID=$NEXT_PUBLIC_LOCAL_CHAIN_ID
ENV NEXT_PUBLIC_LOCAL_PROVIDER_URL=$NEXT_PUBLIC_LOCAL_PROVIDER_URL

WORKDIR /fractal-webapp/

COPY --from=build /fractal-webapp/ .

COPY ./docker/webapp/entrypoint.sh /usr/local/bin

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
