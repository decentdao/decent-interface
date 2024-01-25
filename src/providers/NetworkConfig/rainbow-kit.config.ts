import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { Chain, configureChains, createClient, createStorage, mainnet } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { APP_NAME } from '../../constants/common';
import { supportedChains } from './NetworkConfigProvider';
import { testWallet } from './testWallet';

const supportedWagmiChains = supportedChains.map(config => config.wagmiChain);

// allows connection to localhost only in development mode.
if (process.env.NEXT_PUBLIC_TESTING_ENVIRONMENT) {
  supportedWagmiChains.unshift(hardhat);
}

export const { chains, provider } = configureChains(supportedWagmiChains, [
  jsonRpcProvider({
    rpc: (chain: Chain) => {
      const publicNodeNetworkUrl = `ethereum-${chain.name}.publicnode.com`;
      if (chain.id === mainnet.id) {
        return {
          http: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        };
      }
      return {
        http: `https://${publicNodeNetworkUrl}`,
        webSocket: `wss://${publicNodeNetworkUrl}`,
      };
    },
  }),
]);

const defaultWallets = [
  injectedWallet({ chains }),
  metaMaskWallet({ chains }),
  coinbaseWallet({ appName: APP_NAME, chains }),
  walletConnectWallet({ chains }),
];
// allows connection to localhost only in development mode.
if (process.env.NEXT_PUBLIC_TESTING_ENVIRONMENT) {
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
