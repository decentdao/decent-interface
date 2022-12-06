import { NetworkConfig } from '../NetworkConfigProvider';

export const sepoliaConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-sepolia.safe.global',
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
    claimingFactory: '',
    claimingMasterCopy: '',
  },
};
