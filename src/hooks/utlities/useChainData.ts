import { useMemo } from 'react';

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
  1115511: {
    nameKey: 'sepolia',
    chainId: 11155111,
    color: 'grayscale.white',
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

export function useChainData(chainId: number) {
  const chainMetaData = useMemo(() => chainsMetaData[chainId], [chainId]);
  return chainMetaData;
}
