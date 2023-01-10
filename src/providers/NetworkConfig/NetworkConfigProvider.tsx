import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { goerliConfig } from './networks';
import { NetworkConfig } from './types';

export const defaultState = {
  safeBaseURL: '',
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    fractalUsulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalNameRegistry: '',
    votesTokenMasterCopy: '',
    claimingMasterCopy: '',
    gnosisVetoGuardMasterCopy: '',
    usulVetoGuardMasterCopy: '',
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
    // @todo create config file for mainnet
    case 1:
    default:
      return defaultState;
  }
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const provider = useProvider();
  console.log(
    '🚀 ~ file: NetworkConfigProvider.tsx:46 ~ provider._network.chainId',
    provider._network.chainId
  );
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(provider._network.chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(provider._network.chainId));
  }, [provider]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
