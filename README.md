# Decent Interface

## Local Development

Clone the repository

```shell
$ git clone git@github.com:decentdao/decent-interface.git
```

Change to application's `Node.js` version

```shell
$ nvm use
```

Install the dependencies

```shell
$ npm install
```

Running development environment (without `Netlify` functions)

```shell
$ npm run dev
```

Running development environment (with `Netlify` functions)

```shell
$ npm run dev:netlify
```

### Netlify functions

We're using `Netlify` functions for retrieving various off-chain data.
Currently it's being used to fetch abstract `address`'s ERC-20, ERC-721 and DeFi balances through `Moralis`.
It is crucial to have `Netlify` functions running locally to work with anything related to DAO treasury, for instance

- Treasury page
- Payments feature

## Environmental feature flags

### Setup

During development, add a flag in .env file. It can be of any data type but usually a boolean:

FEATURE_1=false

In code, use following code for code branching:

if (FeatureFlags.instance?.get('FEATURE_1') === true) {
// executed with FEATURE_1=true,
} else {
// executed with FEATURE_1=false,
}

### Testing

Change the value of the flag by adding params on home page:

https://app.dev.decentdao.org?FEATURE_1=true

From then, the flag holds the value from the URL param until app is refreshed

### Deployment and after

Deployment can ship with the flag turned off in .env file.

Change the value in .env file after the feature is completed and thouroughly tested.

Once code under the feature flag has been proven reliable, remove the feature flag and dead code from code base.

## Subgraph

We're using `Subgraph` to index certain "metadata" events to simplify data fetching from application site.
Repository, that implements mapping located [here](https://github.com/decentdao/decent-subgraph).

If you updated mapping and deployed new version - you might need to rebuild `Subgraph` artifacts. Use command below.

Build Subgraph artifacts

```shell
$ npm run graphql:build
```

## Deployment Notes

The "dev" and "prod" environments of this app are currently deployed via `Netlify`.

The "dev" environment tracks the `develop` [branch](https://github.com/decentdao/decent-interface/tree/develop), and the "prod" environment tracks the `main` [branch](https://github.com/decentdao/decent-interface/tree/main).

- dev: https://app.dev.decentdao.org
- prod: https://app.decentdao.org
