import { NetworkConfig } from '../NetworkConfigProvider';

export const mainnetConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
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
    gnosisVetoGuardMasterCopy: '',
    usulVetoGuardMasterCopy: '',
    vetoMultisigVotingMasterCopy: '',
    vetoERC20VotingMasterCopy: '',
  },
};
