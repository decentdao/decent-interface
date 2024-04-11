import { QueryClient } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { http } from 'wagmi';
import { hardhat, sepolia, mainnet, Chain, polygon, baseSepolia } from 'wagmi/chains';
import { supportedChains } from './NetworkConfigProvider';

const supportedWagmiChains = supportedChains.map(config => config.wagmiChain);

// allows connection to localhost only in development mode.
if (import.meta.env.VITE_APP_TESTING_ENVIRONMENT) {
  supportedWagmiChains.unshift(hardhat);
}

export const walletConnectProjectId = import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID;
export const queryClient = new QueryClient();

const wagmiMetadata = {
  name: import.meta.env.VITE_APP_NAME,
  description:
    'Are you outgrowing your Multisig? Fractal extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance.',
  url: import.meta.env.VITE_APP_SITE_URL,
  icons: [`${import.meta.env.VITE_APP_SITE_URL}favicon.icon`],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedWagmiChains as [Chain, ...Chain[]],
  projectId: walletConnectProjectId,
  metadata: wagmiMetadata,
  transports: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
      {
        batch: true,
      },
    ),
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
      {
        batch: true,
      },
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_POLYGON_API_KEY}`,
      {
        batch: true,
      },
    ),
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_BASE_SEPOLIA_API_KEY}`,
      {
        batch: true,
      },
    ),
  },
});

if (walletConnectProjectId) {
  createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });
}
