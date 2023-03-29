# Fractal Interface

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

## Testing - Playwright

### Setup - Docker

- For more information about Docker installation and setup for local development:
  [Docker README](./docker/README.md)

### Running Docker

Once Docker has been installed and set up, you can run the containers with the following command:

```shell
$ docker compose up --build
```

### Running Tests

To run all tests in all 3 browser types (Chromium, Firefox, Webkit) use the following command in a new terminal within the `fractal-interface` project:

```shell
$ npx playwright test
# or, use the predefined npm run script which does the same thing
$ npm run tests
```

To define particular tests to run use the following command:

```shell
$ npx playwright test tests/nameOfTest.spec.ts
```

To run tests in a particular browser type use the following append/flag: `--project=browserType`

Example:

```shell
$ npx playwright test --project=chromium
```

Test results for each test on each browser type will be output into the [playwright-report](./playwright-report/) (HTML) and [test-results](./test-results/)(screenshots and videos) folders.

## Deployment Notes

The "dev", "staging", and "prod" environments of this app are currently deployed via both Netlify and IPFS (see the Github workflow files).

The "dev" environment tracks the `develop` branch, "staging" tracks `staging`, and the "prod" environment tracks the `main` branch. The "dev", "staging", and "prod" Github environments are where custom environment variables are configured.

So at any given time, there are effectively six builds out there, and they are publicly accessible and privately configurable within Github:

1. dev site via Netlify
    - url: https://app.dev.fractalframework.xyz
1. dev [site via IPFS](./docs/IPFS_HOSTING.md)
    - url: http://app.dev.fractalframework.xyz.ipns.localhost:8080/
1. staging site via Netlify
    - url: https://app.staging.fractalframework.xyz
1. staging [site via IPFS](./docs/IPFS_HOSTING.md)
    - url: http://app.staging.fractalframework.xyz.ipns.localhost:8080/
1. prod site via Netlify
    - url: https://app.fractalframework.xyz
1. prod [site via IPFS](./docs/IPFS_HOSTING.md)
    - url: http://app.fractalframework.xyz.ipns.localhost:8080/
