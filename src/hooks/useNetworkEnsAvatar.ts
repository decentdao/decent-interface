import { useEnsAvatar } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsAvatarProps {
  name?: string;
  chainId?: number;
}

export function useNetworkEnsAvatar(props?: UseNetworkEnsAvatarProps) {
  const { chain } = useNetworkConfigStore();
  const propsOrFallbackChainId = props?.chainId ?? chain.id;

  if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
    throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
  }

  return useEnsAvatar({ name: props?.name, chainId: propsOrFallbackChainId });
}
