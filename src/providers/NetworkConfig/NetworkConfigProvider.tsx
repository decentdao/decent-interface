import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useWeb3Provider } from '../Web3Data/hooks/useWeb3Provider';
import { goerliConfig } from './networks';

export type NetworkConfig = {
  safeBaseURL: string;
  contracts: {
    gnosisSafe: string;
    gnosisSafeFactory: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    gnosisMultisend: string;
    usulMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalNameRegistry: string;
    votesTokenMasterCopy: string;
    claimingFactory: string;
    claimingMasterCopy: string;
    vetoGuardMasterCopy: string;
    vetoMultisigVotingMasterCopy: string;
    vetoERC20VotingMasterCopy: string;
  };
};

export const defaultState = {
  safeBaseURL: '',
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    usulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalNameRegistry: '',
    votesTokenMasterCopy: '',
    claimingFactory: '',
    claimingMasterCopy: '',
    vetoGuardMasterCopy: '',
    vetoMultisigVotingMasterCopy: '',
    vetoERC20VotingMasterCopy: '',
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
    setConfig(getNetworkConfig(chainId));
  }, [chainId]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
