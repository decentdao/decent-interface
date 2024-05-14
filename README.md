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

The "dev", "staging", and "prod" environments of this app are currently deployed via Netlify.

The "dev" environment tracks the `develop` branch, "staging" tracks `staging`, and the "prod" environment tracks the `main` branch. The "dev", "staging", and "prod" Github environments are where custom environment variables are configured.

So at any given time, there are effectively three builds out there, and they are publicly accessible and privately configurable within Github:

1. dev site
   - url: https://app.dev.fractalframework.xyz
2. prod site
   - url: https://app.fractalframework.xyz
