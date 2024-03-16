import { defaultWagmiConfig } from '@web3modal/wagmi/react'
import { Chain, configureChains } from 'wagmi';
import { hardhat, sepolia, mainnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { supportedChains } from './NetworkConfigProvider';

const supportedWagmiChains = supportedChains.map(config => config.wagmiChain);

// allows connection to localhost only in development mode.
if (import.meta.env.VITE_APP_TESTING_ENVIRONMENT) {
  supportedWagmiChains.unshift(hardhat);
}

export const { chains, publicClient } = configureChains(supportedWagmiChains, [
  jsonRpcProvider({
    rpc: (chain: Chain) => {
      const publicNodeNetworkUrl = `ethereum-${chain.name}.publicnode.com`;
      if (chain.id === mainnet.id) {
        return {
          http: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
          webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
        };
      } else if (chain.id === sepolia.id) {
        return {
          http: `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
          webSocket: `wss://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
        };
      }
      return {
        http: `https://${publicNodeNetworkUrl}`,
        webSocket: `wss://${publicNodeNetworkUrl}`,
      };
    },
  }),
]);

export const walletConnectProjectId = import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID;
// allows connection to localhost only in development mode.

const wagmiMetadata = {
  name: 'Fractal',
  description: 'Fractal',
  url: 'https://fractalframework.xyz',
  icons: ['https://assets-global.website-files.com/62a0c42025f5e9c3b8955db4/63f6be241f0c205728d5061b_small.ico'] // Icon from our landing page
}

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedWagmiChains,
  projectId: walletConnectProjectId,
  metadata: wagmiMetadata,
  enableCoinbase: true,
  enableInjected: true,
  enableWalletConnect: true
})
