import { useMemo } from 'react';

type EVMChainMetaData = {
  [chainId: number]: {
    chainId: number;
    color: string;
    name: string;
  };
};

const chainsMetaData: EVMChainMetaData = {
  1: {
    name: 'Mainnet',
    chainId: 1,
    color: 'green.300',
  },
  5: {
    name: 'Goerli Test Network',
    chainId: 5,
    color: 'gold.300',
  },
  1115511: {
    name: 'Sepolia Test Network',
    chainId: 11155111,
    color: 'grayscale.white',
  },
  [parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '31337', 10)]: {
    name: 'Local Dev Chain',
    chainId: parseInt(process.env.REACT_APP_LOCAL_CHAIN_ID || '31337', 10),
    color: 'grayscale.400',
  },
  0: {
    name: '',
    chainId: 0,
    color: '',
  },
};

export function useChainData(chainId: number) {
  const chainMetaData = useMemo(() => chainsMetaData[chainId], [chainId]);
  return chainMetaData;
}
