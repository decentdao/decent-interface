FROM node:18.12.1

# Set build-time arguments
ARG NEXT_PUBLIC_TESTING_ENVIRONMENT
ARG NEXT_PUBLIC_LOCAL_CHAIN_ID
ARG NEXT_PUBLIC_LOCAL_PROVIDER_URL

# Set environment variables
ENV NEXT_PUBLIC_TESTING_ENVIRONMENT=$NEXT_PUBLIC_TESTING_ENVIRONMENT
ENV NEXT_PUBLIC_LOCAL_CHAIN_ID=$NEXT_PUBLIC_LOCAL_CHAIN_ID
ENV NEXT_PUBLIC_LOCAL_PROVIDER_URL=$NEXT_PUBLIC_LOCAL_PROVIDER_URL

# Set working directory
WORKDIR /fractal-webapp/

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Copy the entrypoint script
COPY ./docker/webapp/entrypoint.sh /usr/local/bin

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
