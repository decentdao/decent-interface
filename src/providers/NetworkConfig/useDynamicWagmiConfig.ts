import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { supportedNetworks, useNetworkConfigStore } from './useNetworkConfigStore';
import { transportsReducer, wagmiMetadata, walletConnectProjectId } from './web3-modal.config';

// Dynamic Wagmi Config Hook
export const useDynamicWagmiConfig = () => {
  const { chain } = useNetworkConfigStore();

  const wagmiConfig = defaultWagmiConfig({
    chains: [chain],
    projectId: walletConnectProjectId,
    metadata: wagmiMetadata,
    transports: supportedNetworks.reduce(transportsReducer, {}),
    batch: {
      multicall: true,
    },
  });

  // Initialize Web3Modal only once
  if (walletConnectProjectId) {
    createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });
  }

  // Return the dynamic Wagmi client
  return wagmiConfig;
};
