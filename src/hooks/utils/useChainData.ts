import { useMemo } from 'react';
import { useProvider } from 'wagmi';
import { chainsArr } from '../../providers/NetworkConfig/rainbow-kit.config';

type EVMChainMetaData = {
  [chainId: number]: {
    chainId: number;
    color: string;
    nameKey: string;
  };
};

const chainsMetaData: EVMChainMetaData = {
  1: {
    nameKey: 'mainnet',
    chainId: 1,
    color: 'green.300',
  },
  5: {
    nameKey: 'goerli',
    chainId: 5,
    color: 'gold.300',
  },
  137: {
    nameKey: 'polygon',
    chainId: 137,
    color: '#562FB0',
  },
  [parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '31337', 10)]: {
    nameKey: 'local',
    chainId: parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '31337', 10),
    color: 'grayscale.400',
  },
  0: {
    nameKey: '',
    chainId: 0,
    color: '',
  },
};

export function useSupportedENS() {
  const provider = useProvider();
  const networkId = provider.network.chainId;
  return [137].includes(networkId) ? chainsArr[0].id : networkId;
}

export function useChainData(chainId: number) {
  const chainMetaData = useMemo(() => chainsMetaData[chainId], [chainId]);
  return chainMetaData;
}
