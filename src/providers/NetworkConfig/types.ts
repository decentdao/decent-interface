import { Chain } from 'wagmi';

export type NetworkConfig = {
  safeBaseURL: string;
  etherscanBaseURL: string;
  chainId: number;
  name: string;
  color: string;
  nativeTokenSymbol: string;
  nativeTokenIcon: string;
  wagmiChain: Chain;
  contracts: {
    gnosisSafe: string;
    gnosisSafeFactory: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    gnosisMultisend: string;
    fractalUsulMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalRegistry: string;
    votesTokenMasterCopy: string;
    claimingMasterCopy: string;
    gnosisVetoGuardMasterCopy: string;
    usulVetoGuardMasterCopy: string;
    vetoMultisigVotingMasterCopy: string;
    vetoERC20VotingMasterCopy: string;
  };
};
