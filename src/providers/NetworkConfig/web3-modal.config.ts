import { QueryClient } from '@tanstack/react-query';
import { HttpTransport } from 'viem';
import { http } from 'wagmi';
import { NetworkConfig } from '../../types/network';

export const walletConnectProjectId = import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID;
export const queryClient = new QueryClient();

export const wagmiMetadata = {
  name: import.meta.env.VITE_APP_NAME,
  description:
    'Are you outgrowing your Multisig? Decent extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance.',
  url: import.meta.env.VITE_APP_SITE_URL,
  icons: [`${import.meta.env.VITE_APP_SITE_URL}/favicon-96x96.png`],
};

export const transportsReducer = (
  accumulator: Record<string, HttpTransport>,
  network: NetworkConfig,
) => {
  accumulator[network.chain.id] = http(network.rpcEndpoint);
  return accumulator;
};
