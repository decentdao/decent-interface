# Decent Interface

## Local Development

Clone the repository

```shell
$ git clone {repository url}
```

Change to correct Node.js version

```shell
$ nvm use
```

Install the dependencies

```shell
$ npm install
```

Build Subgraph artifacts

```shell
$ npm run graphql:build # For UNIX
```

Running development environment

```shell
$ npm run dev
```

## Deployment Notes

The "dev" and "prod" environments of this app are currently deployed via Netlify.

The "dev" environment tracks the `develop` branch, and the "prod" environment tracks the `main` branch.

- dev: https://app.dev.decentdao.org
- prod: https://app.decentdao.org
