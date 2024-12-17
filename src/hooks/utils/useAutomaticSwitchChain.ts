import { useEffect } from 'react';
import { useSwitchChain, useWalletClient } from 'wagmi';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { getChainIdFromPrefix } from '../../utils/url';

export const useAutomaticSwitchChain = ({
  urlAddressPrefix,
}: {
  urlAddressPrefix: string | undefined;
}) => {
  const { setCurrentConfig, getConfigByChainId, addressPrefix } = useNetworkConfigStore();
  const { isFetchedAfterMount } = useWalletClient();
  const { switchChain } = useSwitchChain({
    mutation: {
      onError: () => {
        if (addressPrefix !== urlAddressPrefix && urlAddressPrefix !== undefined) {
          const chainId = getChainIdFromPrefix(urlAddressPrefix);
          switchChain({ chainId });
        }
      },
    },
  });

  useEffect(() => {
    if (urlAddressPrefix === undefined || addressPrefix === urlAddressPrefix) {
      return;
    }
    const chainId = getChainIdFromPrefix(urlAddressPrefix);
    if (
      addressPrefix !== urlAddressPrefix &&
      urlAddressPrefix !== undefined &&
      isFetchedAfterMount
    ) {
      switchChain({ chainId });
    }
    setTimeout(() => setCurrentConfig(getConfigByChainId(chainId)), 300);
  }, [
    addressPrefix,
    setCurrentConfig,
    getConfigByChainId,
    urlAddressPrefix,
    switchChain,
    isFetchedAfterMount,
  ]);
};
