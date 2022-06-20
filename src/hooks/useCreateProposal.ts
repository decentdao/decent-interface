import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { GovernorModule, GovernorModule__factory } from '../assets/typechain-types/module-governor';
import { useDAOData } from '../contexts/daoData/index';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { ProposalData } from '../types/proposal';

const useCreateProposal = ({
  proposalData,
  setPending,
  successCallback,
}: {
  proposalData: ProposalData | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
  successCallback: () => void;
}) => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const [daoData] = useDAOData();

  const [contractCallCreateProposal, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let createProposal = useCallback(() => {
    if (!signerOrProvider || !proposalData || !setPending || !daoData || !daoData.moduleAddresses) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(
      daoData.moduleAddresses[1],
      signerOrProvider
    );

    contractCallCreateProposal({
      contractFn: () =>
        governor.propose(
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          proposalData.description
        ),
      pendingMessage: 'Creating Proposal...',
      failedMessage: 'Proposal Creation Failed',
      successMessage: 'Proposal Created',
      successCallback: () => {
        successCallback();
      },
    });
  }, [
    contractCallCreateProposal,
    daoData,
    proposalData,
    setPending,
    signerOrProvider,
    successCallback,
  ]);
  return createProposal;
};

export default useCreateProposal;
