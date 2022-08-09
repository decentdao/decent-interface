import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { ethers } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { ProposalData } from '../providers/govenor/types';

const useQueueTransaction = ({
  proposalData,
  setPending,
}: {
  proposalData: ProposalData;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const { governorModuleContract } = useGovenorModule();

  const [contractCallQueueTransaction, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let queueTransaction = useCallback(() => {
    if (!signerOrProvider || !proposalData || !governorModuleContract) {
      return;
    }

    contractCallQueueTransaction({
      contractFn: () =>
        governorModuleContract.queue(
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          ethers.utils.id(proposalData.description)
        ),
      pendingMessage: 'Queuing Transaction...',
      failedMessage: 'Queuing Failed',
      successMessage: 'Queuing Completed',
    });
  }, [contractCallQueueTransaction, governorModuleContract, proposalData, signerOrProvider]);
  return queueTransaction;
};

export default useQueueTransaction;
