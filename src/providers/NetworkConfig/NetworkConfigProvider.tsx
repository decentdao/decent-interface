import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { goerliConfig } from './networks';

export type NetworkConfig = {
  safeBaseURL: string;
  contracts: {
    gnosisFactory: string;
    gnosisSafe: string;
    gnosisMultisend: string;
    usulMasterCopy: string;
    zodiacProxyFactory: string;
    oneToOneTokenVotingMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalNameRegistry: string;
    votesTokenMasterCopy: string;
  };
};

export const defaultState = {
  safeBaseURL: '',
  contracts: {
    gnosisFactory: '',
    gnosisSafe: '',
    votesTokenMasterCopy: '',
    gnosisMultisend: '',
    usulMasterCopy: '',
    zodiacProxyFactory: '',
    oneToOneTokenVotingMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalNameRegistry: '',
  },
};

export const NetworkConfigContext = createContext({} as NetworkConfig);

export const useNetworkConfg = (): NetworkConfig =>
  useContext(NetworkConfigContext as Context<NetworkConfig>);

const getNetworkConfig = (chainId: number) => {
  switch (chainId) {
    case 5:
    case 31337:
      return goerliConfig;
    // @todo create config files for mainnet and sepolia networks
    case 1:
    case 11155111:
    default:
      return defaultState;
  }
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const {
    state: { chainId },
  } = useWeb3Provider();
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(chainId));

  useEffect(() => {
    switch (chainId) {
      case 5:
      case 31337:
        setConfig(goerliConfig);
        break;
      case 1:
      case 11155111:
        break;
    }
  }, [chainId]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
