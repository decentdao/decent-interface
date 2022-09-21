FROM node:16


# COPY . ./fractal-webapp

COPY package.json /fractal-webapp/package.json
COPY package-lock.json ./fractal-webapp/package.json
COPY docker/webapp/.webapp.env.test ./fractal-webapp/.env.local

COPY . ./fractal-webapp

COPY docker/webapp/entrypoint.sh /usr/local/bin
# install needed dependencies

# RUN apk --no-cache --virtual build-dependencies add python3 make g++
WORKDIR /fractal-webapp/

RUN npm install

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]

# keeps server running
CMD ["npm run start"]
