import { ReactNode, useMemo } from 'react';
import useClaimModule from './hooks/useClaimModule';
import { GovernorContext } from './hooks/useGovenorModule';
import useGovernorModuleContract from './hooks/useGovernorModuleContract';
import useProposals from './hooks/useProposals';
import useTimelockModuleContract from './hooks/useTimelockModuleContract';
import useTokenContract from './hooks/useTokenContract';
import useTokenData from './hooks/useTokenData';

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
  const votingTokenData = useTokenData(votingTokenContract, claimModuleContract);
  const proposals = useProposals(governorModuleContract);
  const value = useMemo(
    () => ({
      governorModuleContract,
      timelockModuleContract,
      proposals,
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
    ]
  );
  return <GovernorContext.Provider value={value}>{children}</GovernorContext.Provider>;
}
