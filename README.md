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
