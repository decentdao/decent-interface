# Current Networks

Fractal currently supports:

- [Goerli Testnet](https://goerli.net/)
- [Polygon (Matic) mainnet](https://polygon.technology/)

It is possible to easily deploy Fractal on any EVM chain that has both [Safe](https://docs.gnosis-safe.io/learn/gnosis-safe/gnosis-safe-on-other-evm-based-networks) and [Wagmi](https://www.npmjs.com/package/@wagmi/chains) support.

# Adding EVM network support

The steps to add support for additional EVM networks include:

1. Deploy the [Fractal contracts](https://github.com/decent-dao/fractal-contracts) to the new EVM chain and publish the contract addresses to our NPM package.  An example for our [Polygon deployment is here](https://github.com/decent-dao/fractal-contracts/pull/26).
2. Update to this new NPM package version in the `package.json` file.
3. Add a `NetworkConfig` file under `src/providers/NetworkConfig/networks/{your new network}.ts`.
4. Add a case to return this new `NetworkConfig` to `src/providers/NetworkConfig/NetworkConfigProvider.tsx` for the new network's chainId.
5. Add the network's English name (as defined by its json key in the `NetworkConfig`) in `src/i18n/locales/en/menu.json`.
6. Add the network to the `supportedChains` array in `src/providers/NetworkConfig/rainbow-kit.config.ts`