import { useEffect } from 'react';
import { useChainId } from 'wagmi';
import { useNetworkConfigStore } from './useNetworkConfigStore';

// Custom hook to use the network config
export const useSetNetworkConfig = () => {
  const { getConfigByChainId, setCurrentConfig } = useNetworkConfigStore();
  const currentChainId = useChainId();

  // Update currentConfig when chainId changes
  useEffect(() => {
    try {
      const newConfig = getConfigByChainId(currentChainId);
      setCurrentConfig(newConfig);
    } catch (error) {
      console.error(error);
    }
  }, [currentChainId, getConfigByChainId, setCurrentConfig]);
};
