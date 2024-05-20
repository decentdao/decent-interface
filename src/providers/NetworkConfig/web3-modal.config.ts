import { QueryClient } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { HttpTransport } from 'viem';
import { http } from 'wagmi';
import { Chain, hardhat } from 'wagmi/chains';
import { NetworkConfig } from '../../types/network';
import { supportedNetworks } from './NetworkConfigProvider';

const supportedWagmiChains = supportedNetworks.map(network => network.chain);

// allows connection to localhost only in development mode.
if (import.meta.env.VITE_APP_TESTING_ENVIRONMENT) {
  supportedWagmiChains.unshift(hardhat);
}

export const walletConnectProjectId = import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID;
export const queryClient = new QueryClient();

const wagmiMetadata = {
  name: import.meta.env.VITE_APP_NAME,
  description:
    'Are you outgrowing your Multisig? Decent extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance.',
  url: import.meta.env.VITE_APP_SITE_URL,
  icons: [`${import.meta.env.VITE_APP_SITE_URL}/favicon.ico`],
};

const transportsReducer = (accumulator: Record<string, HttpTransport>, network: NetworkConfig) => {
  accumulator[network.chain.id] = http(network.rpcEndpoint, {
    batch: true,
  });
  return accumulator;
};

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedWagmiChains as [Chain, ...Chain[]],
  projectId: walletConnectProjectId,
  metadata: wagmiMetadata,
  transports: supportedNetworks.reduce(transportsReducer, {}),
});

if (walletConnectProjectId) {
  createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });
}
