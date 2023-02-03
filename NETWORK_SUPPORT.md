# Current Networks

Fractal currently supports:

- [Goerli Testnet](https://goerli.net/)
- [Polygon (Matic) mainnet](https://polygon.technology/)

It is possible to deploy Fractal on any EVM chain that has [Safe support](https://docs.gnosis-safe.io/learn/gnosis-safe/gnosis-safe-on-other-evm-based-networks).

# Adding EVM network support

The steps to add support for additional EVM networks include:

1. Deploy the [Fractal contracts](https://github.com/decent-dao/fractal-contracts) to the new EVM chain and publish the contract addresses to our NPM package.  An example for our [Polygon deployment is here](https://github.com/decent-dao/fractal-contracts/pull/26).
2. Update to the new NPM package version in the [Fractal Interface](https://github.com/decent-dao/fractal-interface)'s package.json file.
3. Add the network's id to `REACT_APP_SUPPORTED_CHAIN_IDS` in `.env` and update `REACT_APP_SUPPORTED_CHAIN_IDS` in that app's Github and Netlify 'secrets' as well.
4. Add support for the new network in `src/hooks/utils/useChainData.ts`, including in `EVMChainMetaData`, `useNativeSymbol`, and `useNativeIcon`.
5. Add the network's English name for frontend display in `src/i18n/locales/en/menu.json`.
6. Add a `NetworkConfig` file under `src/providers/NetworkConfig/networks/{your new network}.ts`
7. Add a case to return this new `NetworkConfig` to `src/providers/NetworkConfig/NetworkConfigProvider.tsx`
8. Add the network name / id in `src/providers/Fractal/utils/api.ts`
9. Add the network to the `chainsArr` in `src/providers/NetworkConfig/rainbow-kit.config.ts`