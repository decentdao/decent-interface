import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsNameProps {
  address?: Address;
  chainId?: number;
}

export function useNetworkEnsName(props?: UseNetworkEnsNameProps) {
  const { chain } = useNetworkConfigStore();
  const propsOrFallbackChainId = props?.chainId ?? chain.id;

  if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
    throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
  }

  return useEnsName({ address: props?.address, chainId: propsOrFallbackChainId });
}
