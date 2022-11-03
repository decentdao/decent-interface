import { ethers } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useTransaction } from '../contexts/web3Data/transactions';
import { ProposalData } from '../providers/govenor/types';
import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';

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

  const { t } = useTranslation('transaction');

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
      pendingMessage: t('pendingQueue'),
      failedMessage: t('failedQueue'),
      successMessage: t('successQueue'),
    });
  }, [contractCallQueueTransaction, governorModuleContract, proposalData, signerOrProvider, t]);
  return queueTransaction;
};

export default useQueueTransaction;
