import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, createStorage, goerli } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { testWallet } from './testWallet';
export const chainsArr = [goerli];

console.log(
  '🚀 ~ file: rainbow-kit.config.ts:15 ~ process.env.REACT_APP_TESTING_ENVIROMENT',
  process.env.REACT_APP_TESTING_ENVIROMENT
);
// allows connection to localhost only in development mode.
if (process.env.REACT_APP_TESTING_ENVIROMENT) {
  chainsArr.unshift(hardhat);
}

export const { chains, provider } = configureChains(chainsArr, [
  infuraProvider({ priority: 0, apiKey: process.env.REACT_APP_INFURA_API_KEY! }),
  alchemyProvider({ priority: 1, apiKey: process.env.REACT_APP_ALCHEMY_API_KEY! }),
  publicProvider({ priority: 2 }),
]);

const defaultWallets = [injectedWallet({ chains }), walletConnectWallet({ chains })];
// allows connection to localhost only in development mode.
if (process.env.REACT_APP_TESTING_ENVIROMENT) {
  defaultWallets.unshift(testWallet({ chains }));
}

const connectors = connectorsForWallets([
  {
    // @note no translation here.
    groupName: 'Supported',
    wallets: defaultWallets,
  },
]);

export const wagmiClient = createClient({
  autoConnect: true,
  storage: createStorage({ storage: window.localStorage }),
  connectors,
  provider,
});
