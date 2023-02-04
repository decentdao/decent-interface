import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDisconnect, useNetwork, useProvider } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { goerliConfig } from './networks';
import { polygonConfig } from './networks/polygon';
import { NetworkConfig } from './types';

export const defaultState = {
  safeBaseURL: '',
  etherscanBaseURL: '',
  chainId: 0,
  name: '',
  color: '',
  nativeTokenSymbol: '',
  nativeTokenIcon: '',
  wagmiChain: goerli,
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    fractalUsulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalRegistry: '',
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

export const supportedChains = [goerliConfig, polygonConfig];

const getNetworkConfig = (chainId: number) => {
  return supportedChains.find(chain => chain.chainId === chainId) || defaultState;
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { t } = useTranslation('menu');
  const { disconnect } = useDisconnect();
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(provider.network.chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(provider.network.chainId));
  }, [provider]);

  useEffect(() => {
    const supportedChainIds = supportedChains.map(c => c.chainId) || [];

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
