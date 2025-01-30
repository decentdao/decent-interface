import { useEnsAddress } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsAddressProps {
  name?: string;
  chainId?: number;
}

export function useNetworkEnsAddress(props?: UseNetworkEnsAddressProps) {
  const { chain } = useNetworkConfigStore();
  const propsOrFallbackChainId = props?.chainId ?? chain.id;

  if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
    throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
  }

  return useEnsAddress({ name: props?.name, chainId: propsOrFallbackChainId });
}
