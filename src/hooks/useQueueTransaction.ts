import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { GovernorModule, GovernorModule__factory } from '../assets/typechain-types/module-governor';
import { useDAOData } from '../contexts/daoData/index';
import { ProposalData } from '../contexts/daoData/useProposals';
import { ethers } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

const useQueueTransaction = ({
  proposalData,
  setPending,
}: {
  proposalData: ProposalData;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signer },
  } = useWeb3Provider();
  const [daoData] = useDAOData();

  const [contractCallQueueTransaction, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let queueTransaction = useCallback(() => {
    if (!signer || !proposalData || !daoData || !daoData.moduleAddresses) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(
      daoData.moduleAddresses[1],
      signer
    );
    contractCallQueueTransaction({
      contractFn: () =>
        governor.queue(
          proposalData.targets,
          [0],
          proposalData.calldatas,
          ethers.utils.id(proposalData.description)
        ),
      pendingMessage: 'Queuing Transaction...',
      failedMessage: 'Queuing Failed',
      successMessage: 'Queuing Completed',
    });
  }, [contractCallQueueTransaction, daoData, proposalData, signer]);
  return queueTransaction;
};

export default useQueueTransaction;
