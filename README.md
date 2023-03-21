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

Both the "dev" and "prod" environments of this app are currently deployed via both Netlify and IPFS (see the Github workflow files).

The "dev" environment tracks the `develop` branch, and the "prod" environment tracks the `main` branch.

On both hosting platforms, both the "dev" and "prod" environments are where custom environment variables are configured. For Netlify, it's in the site's build settings in the Netlify project. For the IPFS build, it's in Github's "secrets", and exposed to the build scripts in `.github/workflows/release-ipfs-[dev|prod].yaml`.

So at any given time, there are effectively four builds out there, and they are publicly accessible and privately configurable as follows:

1. dev site via Netlify
    - url: https://app.dev.fractalframework.xyz
    - env vars
      - netlify: https://app.netlify.com/sites/fractal-framework-interface-dev/settings/deploys#environment
1. dev [site via IPFS](./docs/IPFS_HOSTING.md)
    - url: http://app.dev.fractalframework.xyz.ipns.localhost:8080/
    - env vars
      - github: https://github.com/decent-dao/fractal-interface/settings/environments/486034480/edit
      - workflow: [./.github/workflows/release-ipfs-dev.yaml](./.github/workflows/release-ipfs-dev.yaml)
1. prod site via Netlify
    - url: https://app.fractalframework.xyz
    - env vars
      - netlify: https://app.netlify.com/sites/fractal-framework-interface/settings/deploys#environment
1. prod [site via IPFS](./docs/IPFS_HOSTING.md)
    - url: http://app.fractalframework.xyz.ipns.localhost:8080/
    - env vars
      - github: https://github.com/decent-dao/fractal-interface/settings/environments/503834178/edit
      - workflow: [./.github/workflows/release-ipfs-prod.yaml](./.github/workflows/release-ipfs-prod).

_TL;DR: When making changes to either "dev" or "prod" configurations, perform updates both on Netlify and in Github Secrets / Workflow_
