import { NetworkConfig } from '../types';

export const mainnetConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  chainId: 1,
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
