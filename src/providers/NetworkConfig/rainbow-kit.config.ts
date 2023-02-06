import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, createStorage } from 'wagmi';
import { goerli, hardhat, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { testWallet } from './testWallet';

export const chainsArr = [goerli, polygon];

// allows connection to localhost only in development mode.
if (process.env.REACT_APP_TESTING_ENVIROMENT) {
  chainsArr.unshift(hardhat);
}

export const { chains, provider } = configureChains(chainsArr, [
  infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY! }),
  alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY! }),
  publicProvider(),
]);

const defaultWallets = [
  metaMaskWallet({ chains }),
  coinbaseWallet({ appName: 'Fractal', chains }),
  walletConnectWallet({ chains }),
];
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
