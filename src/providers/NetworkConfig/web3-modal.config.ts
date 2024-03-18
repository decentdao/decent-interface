import { defaultWagmiConfig } from '@web3modal/wagmi/react';
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

const wagmiMetadata = {
  name: import.meta.env.VITE_APP_NAME,
  description:
    'Are you outgrowing your Multisig? Fractal extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance.',
  url: import.meta.env.VITE_APP_SITE_URL,
  icons: [`${import.meta.env.VITE_APP_SITE_URL}favicon.icon`],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedWagmiChains,
  projectId: walletConnectProjectId,
  metadata: wagmiMetadata,
});
