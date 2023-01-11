import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDisconnect, useNetwork, useProvider } from 'wagmi';
import { goerliConfig } from './networks';
import { NetworkConfig } from './types';

export const defaultState = {
  safeBaseURL: '',
  chainId: 0,
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
  const { chain } = useNetwork();
  const { t } = useTranslation('menu');
  const { disconnect } = useDisconnect();
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(provider._network.chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(provider._network.chainId));
  }, [provider]);

  useEffect(() => {
    const supportedChainIds =
      process.env.REACT_APP_SUPPORTED_CHAIN_IDS?.split(',').map(id => parseInt(id)) || [];

    if (
      !!chain &&
      !supportedChainIds.includes(chain.id) &&
      !process.env.REACT_APP_TESTING_ENVIROMENT
    ) {
      toast(t('toastSwitchChain', { chainNames: supportedChainIds }), {
        toastId: 'switchChain',
      });
      disconnect();
    }
  }, [chain, disconnect, t]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
