import { ReactNode, useMemo } from 'react';
import useBlockchainDatas from '../../contexts/blockchainData/blockchainData';
import useClaimModule from './hooks/useClaimModule';
import { GovernorContext } from './hooks/useGovenorModule';
import useGovernorModuleContract from './hooks/useGovernorModuleContract';
import useProposals from './hooks/useProposals';
import useTimelockModuleContract from './hooks/useTimelockModuleContract';
import useTokenContract from './hooks/useTokenContract';
import useTokenData from './hooks/useTokenData';

export function GovernorModuleProvider({
  moduleAddresses,
  children,
}: {
  moduleAddresses: string[];
  children: ReactNode;
}) {
  const claimModuleContract = useClaimModule(moduleAddresses);
  const governorModuleContract = useGovernorModuleContract(moduleAddresses);
  const timelockModuleContract = useTimelockModuleContract(moduleAddresses);
  const votingTokenContract = useTokenContract(governorModuleContract);
  const votingTokenData = useTokenData(votingTokenContract, claimModuleContract);
  const { currentBlockNumber } = useBlockchainDatas();
  const proposals = useProposals(governorModuleContract, currentBlockNumber);
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
  <GovernorContext.Provider value={value}>{children}</GovernorContext.Provider>;
}
