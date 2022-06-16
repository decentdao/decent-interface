import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { GovernorModule, GovernorModule__factory } from '../assets/typechain-types/module-governor';
import { useDAOData } from '../contexts/daoData/index';
import { ProposalData } from '../contexts/daoData/useProposals';
import { ethers } from 'ethers';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

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
  const [daoData] = useDAOData();

  const [contractCallExecuteTransaction, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let executeTransaction = useCallback(() => {
    if (!signerOrProvider || !proposalData || !daoData || !daoData.moduleAddresses) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(
      daoData.moduleAddresses[1],
      signerOrProvider
    );
    contractCallExecuteTransaction({
      contractFn: () =>
        governor.execute(
          proposalData.targets,
          [0],
          proposalData.calldatas,
          ethers.utils.id(proposalData.description)
        ),
      pendingMessage: 'Executing Transaction',
      failedMessage: 'Executing Failed',
      successMessage: 'Executing Completed',
    });
  }, [contractCallExecuteTransaction, daoData, proposalData, signerOrProvider]);
  return executeTransaction;
};

export default useExecuteTransaction;
