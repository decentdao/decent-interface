import { useCallback } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useDAOData } from '../contexts/daoData/index';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { ProposalData } from '../types/proposal';

const useCreateProposal = () => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [
    {
      modules: {
        governor: { governorModuleContract },
      },
    },
  ] = useDAOData();

  const [contractCallCreateProposal, contractCallPending] = useTransaction();

  const createProposal = useCallback(
    ({
      proposalData,
      successCallback,
    }: {
      proposalData: ProposalData | undefined;
      successCallback: () => void;
    }) => {
      if (!signerOrProvider || !proposalData || !governorModuleContract) {
        return;
      }

      contractCallCreateProposal({
        contractFn: () =>
          governorModuleContract.propose(
            proposalData.targets,
            proposalData.values,
            proposalData.calldatas,
            proposalData.description
          ),
        pendingMessage: 'Creating Proposal...',
        failedMessage: 'Proposal Creation Failed',
        successMessage: 'Proposal Created',
        successCallback,
      });
    },
    [contractCallCreateProposal, governorModuleContract, signerOrProvider]
  );

  return [createProposal, contractCallPending] as const;
};

export default useCreateProposal;
