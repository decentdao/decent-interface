import { useEffect, useMemo, useState } from 'react';
import { useProvider } from 'wagmi';
import ethDefault from '../../assets/images/coin-icon-eth.svg';
import polygonDefault from '../../assets/images/coin-icon-polygon.svg';
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

export function useNativeSymbol() {
  const provider = useProvider();
  const networkId = provider.network.chainId;
  switch (networkId) {
    case 137:
      return 'MATIC';
    case 1:
    case 5:
    default:
      return 'ETH';
  }
}

export function useNativeIcon() {
  const provider = useProvider();
  const networkId = provider.network.chainId;
  switch (networkId) {
    case 137:
      return polygonDefault;
    case 1:
    case 5:
    default:
      return ethDefault;
  }
}

export function useEtherscanDomain() {
  const provider = useProvider();
  const [url, setUrl] = useState('');

  useEffect(() => {
    switch (provider.network.name) {
      case 'goerli':
        setUrl('https://goerli.etherscan.io');
        break;
      case 'matic':
        setUrl('https://polygonscan.com');
        break;
      default:
        setUrl('https://etherscan.io');
    }
  }, [provider]);

  return url;
}
