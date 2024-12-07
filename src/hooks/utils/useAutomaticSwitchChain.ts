import { useEffect } from 'react';
import { useSwitchChain } from 'wagmi';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { getChainIdFromPrefix } from '../../utils/url';

export const useAutomaticSwitchChain = ({
  urlAddressPrefix,
}: {
  urlAddressPrefix: string | undefined;
}) => {
  const { setCurrentConfig, getConfigByChainId, addressPrefix } = useNetworkConfigStore();
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
    setCurrentConfig(getConfigByChainId(chainId));
    if (addressPrefix !== urlAddressPrefix && urlAddressPrefix !== undefined) {
      switchChain({ chainId });
    }
  }, [addressPrefix, setCurrentConfig, getConfigByChainId, urlAddressPrefix, switchChain]);
};
