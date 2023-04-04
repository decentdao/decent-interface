# Current Networks

Fractal currently supports:

- [Goerli Testnet](https://goerli.net/)

It is possible to easily deploy Fractal on any EVM chain that has [Safe](https://docs.gnosis-safe.io/learn/gnosis-safe/gnosis-safe-on-other-evm-based-networks), [Wagmi](https://www.npmjs.com/package/@wagmi/chains), and [Graph](https://thegraph.com) support.

# Adding EVM network support

The steps to add support for additional EVM networks include:

1. Deploy the [Fractal contracts](https://github.com/decent-dao/fractal-contracts) to the new EVM chain and publish the contract addresses to our NPM package.
2. Update to this new NPM package version in the `package.json` file.
3. Add a `NetworkConfig` file under `src/providers/NetworkConfig/networks/{your new network}.ts`.
4. Add the network to the `supportedChains` array in `src/providers/NetworkConfig/NetworkConfigProvider.tsx`.