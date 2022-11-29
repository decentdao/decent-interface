import { NetworkConfig } from '../NetworkConfigProvider';

export const sepoliaConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-sepolia.safe.global',
  contracts: {
    gnosisSafe: '',
    gnosisSafeFactory: '',
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    gnosisMultisend: '',
    usulMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalNameRegistry: '',
    votesMasterCopy: '',
    claimingFactory: '',
    claimingMasterCopy: '',
    vetoGuardMasterCopy: '',
    vetoMultisigVotingMasterCopy: '',
    vetoERC20VotingMasterCopy: '',
  },
};
