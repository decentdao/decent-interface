export type NetworkConfig = {
  safeBaseURL: string;
  contracts: {
    gnosisSafe: string;
    gnosisSafeFactory: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    gnosisMultisend: string;
    fractalUsulMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalNameRegistry: string;
    votesTokenMasterCopy: string;
    claimingMasterCopy: string;
    gnosisVetoGuardMasterCopy: string;
    usulVetoGuardMasterCopy: string;
    vetoMultisigVotingMasterCopy: string;
    vetoERC20VotingMasterCopy: string;
  };
};
