import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { ethers } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { ProposalData } from '../providers/govenor/types';
import { useTranslation } from 'react-i18next';

const useExecuteTransaction = ({
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

  const [contractCallExecuteTransaction, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  let executeTransaction = useCallback(() => {
    if (!signerOrProvider || !proposalData || !governorModuleContract) {
      return;
    }

    contractCallExecuteTransaction({
      contractFn: () =>
        governorModuleContract.execute(
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          ethers.utils.id(proposalData.description)
        ),
      pendingMessage: t('pendingTransaction'),
      failedMessage: t('failedTransaction'),
      successMessage: t('successTransaction'),
    });
  }, [contractCallExecuteTransaction, governorModuleContract, proposalData, signerOrProvider, t]);
  return executeTransaction;
};

export default useExecuteTransaction;
