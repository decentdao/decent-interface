import { Address } from 'viem';
import { mainnet } from 'viem/chains';
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
  const ensNetworkOrMainnet = supportedEnsNetworks.includes(props?.chainId ?? chain.id)
    ? chain.id
    : mainnet.id;

  return useEnsName({ address: props?.address, chainId: ensNetworkOrMainnet });
}
