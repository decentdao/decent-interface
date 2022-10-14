import { ReactNode, useMemo } from 'react';
import useClaimModule from './hooks/useClaimModule';
import useCreateProposal from './hooks/useCreateProposal';
import { GovernorContext } from './hooks/useGovenorModule';
import useGovernorModuleContract from './hooks/useGovernorModuleContract';
import useProposals from './hooks/useProposals';
import useTimelockModuleContract from './hooks/useTimelockModuleContract';
import useTokenContract from './hooks/useTokenContract';
import useTokenData from './hooks/useTokenData';

/**
 * Uses React Context API to provider child components with the Token Voting Governor Module
 */
export function GovernorModuleProvider({
  claimingContractAddress,
  timeLockModuleAddress,
  moduleAddress,
  children,
}: {
  timeLockModuleAddress: string | undefined;
  claimingContractAddress: string | undefined;
  moduleAddress: string | null;
  children: ReactNode;
}) {
  const governorModuleContract = useGovernorModuleContract(moduleAddress);
  const claimModuleContract = useClaimModule(claimingContractAddress);
  const timelockModuleContract = useTimelockModuleContract(timeLockModuleAddress);
  const votingTokenContract = useTokenContract(governorModuleContract);
  const votingTokenData = useTokenData(
    governorModuleContract,
    votingTokenContract,
    claimModuleContract
  );
  const proposals = useProposals(governorModuleContract);

  const [createProposal, pending] = useCreateProposal(governorModuleContract);
  const value = useMemo(
    () => ({
      governorModuleContract,
      timelockModuleContract,
      proposals,
      createProposal: {
        submitProposal: createProposal,
        pendingCreateTx: pending,
      },
      votingToken: {
        votingTokenContract,
        votingTokenData,
      },
      claimModuleContract,
    }),
    [
      governorModuleContract,
      timelockModuleContract,
      proposals,
      votingTokenContract,
      votingTokenData,
      claimModuleContract,
      createProposal,
      pending,
    ]
  );
  return <GovernorContext.Provider value={value}>{children}</GovernorContext.Provider>;
}
