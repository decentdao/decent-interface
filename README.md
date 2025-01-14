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

Running development environment

```shell
$ npm run dev
```

### Netlify functions

We're using `Netlify` functions for retrieving various off-chain data. You can run these using `npm run dev:netlify`.
Currently it's being used to fetch abstract `address`'s ERC-20, ERC-721 and DeFi balances through `Moralis`.
It is crucial to have `Netlify` functions running locally to work with anything related to DAO treasury, for instance

- Treasury page
- Payments feature

### Environment Variables

The application uses one set of environment variables:

1. **Application Environment Variables** (`.env.local`)
   - Copy `.env` to `.env.local` for local development
   - Contains Vite-injected variables for the React application
   - In production, these also need to be manually configured as "secrets" in the Cloudflare Dashboard

## Subgraph

We're using `Subgraph` to index certain "metadata" events to simplify data fetching from application site.
Repository, that implements mapping located [here](https://github.com/decentdao/decent-subgraph).

If you updated mapping and deployed new version - you might need to rebuild `Subgraph` artifacts. Use command below.

Build Subgraph artifacts

```shell
$ npm run graphql:build
```

## Deployment Notes

This app is deployed on Cloudflare Pages with the following configuration:

- Production deployment (tracking `main` branch): https://app.new.decentdao.org
- All other branches get preview deployments at: https://branch-name.decent-interface.pages.dev
