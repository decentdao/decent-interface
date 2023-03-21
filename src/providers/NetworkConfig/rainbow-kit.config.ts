import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, createStorage } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { supportedChains } from './NetworkConfigProvider';
import { testWallet } from './testWallet';

const supportedWagmiChains = supportedChains.map(config => config.wagmiChain);

// allows connection to localhost only in development mode.
if (process.env.NEXT_PUBLIC_TESTING_ENVIROMENT) {
  supportedWagmiChains.unshift(hardhat);
}

export const { chains, provider } = configureChains(supportedWagmiChains, [
  infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }),
  alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  publicProvider(),
]);

const defaultWallets = [
  injectedWallet({ chains }),
  metaMaskWallet({ chains }),
  coinbaseWallet({ appName: 'Fractal', chains }),
  walletConnectWallet({ chains }),
];
// allows connection to localhost only in development mode.
if (process.env.NEXT_PUBLIC_TESTING_ENVIROMENT) {
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
  storage:
    typeof window !== 'undefined'
      ? createStorage({
          storage: window.localStorage,
        })
      : undefined,
  connectors,
  provider,
});
