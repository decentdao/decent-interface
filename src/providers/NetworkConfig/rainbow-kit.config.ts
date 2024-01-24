import '@rainbow-me/rainbowkit/styles.css';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createPublicClient, http, Chain } from 'viem';
import { configureChains, createStorage, createConfig, mainnet } from 'wagmi';
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

export const { chains } = configureChains(supportedWagmiChains, [
  jsonRpcProvider({
    rpc: (chain: Chain) => {
      const networkUrl = `${
        chain.id === mainnet.id ? 'ethereum' : 'ethereum-' + chain.name
      }.publicnode.com`;
      return { http: `https://${networkUrl}`, webSocket: `wss://${networkUrl}` };
    },
  }),
]);

const defaultWallets = [injectedWallet({ chains }), coinbaseWallet({ appName: APP_NAME, chains })];

if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  defaultWallets.push(
    walletConnectWallet({ chains, projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID })
  );
  defaultWallets.push(
    metaMaskWallet({ chains, projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID })
  );
}
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

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    transport: http(),
    chain: mainnet,
  }),
  storage:
    typeof window !== 'undefined'
      ? createStorage({
          storage: window.localStorage,
        })
      : undefined,
  connectors,
});
