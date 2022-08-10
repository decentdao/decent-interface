import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { ethers } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { ProposalData } from '../providers/govenor/types';

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
      pendingMessage: 'Executing Transaction',
      failedMessage: 'Executing Failed',
      successMessage: 'Executing Completed',
    });
  }, [contractCallExecuteTransaction, governorModuleContract, proposalData, signerOrProvider]);
  return executeTransaction;
};

export default useExecuteTransaction;
