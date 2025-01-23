import { mainnet } from 'viem/chains';
import { useEnsAvatar } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsAvatarProps {
  name?: string;
  chainId?: number;
}

export function useNetworkEnsAvatar(props: UseNetworkEnsAvatarProps | undefined) {
  const { chain } = useNetworkConfigStore();
  const ensNetworkOrMainnet = supportedEnsNetworks.includes(props?.chainId ?? chain.id)
    ? chain.id
    : mainnet.id;

  return useEnsAvatar({ name: props?.name, chainId: ensNetworkOrMainnet });
}
