import { useCallback } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from './index';
import { ProposalData } from "../daoData/useProposals";
import { ethers } from 'ethers';


const useExecuteTransaction = ({
  proposalData
}: {
  proposalData: ProposalData
}
) => {
  const { signerOrProvider } = useWeb3();
  const [daoData,] = useDAOData();

  const [contractCallExecuteTransaction] = useTransaction();

  let executeTransaction = useCallback(() => {
    if (
      !signerOrProvider ||
      !proposalData ||
      !daoData ||
      !daoData.moduleAddresses
    ) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(daoData.moduleAddresses[1], signerOrProvider);
    contractCallExecuteTransaction({
      contractFn: () => governor.execute(proposalData.targets, [0], proposalData.calldatas, ethers.utils.id(proposalData.description)),
      pendingMessage: "Executing Transaction",
      failedMessage: "Executing Failed",
      successMessage: "Executing Completed",
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [contractCallExecuteTransaction, daoData, proposalData, signerOrProvider])
  return executeTransaction;
}

export default useExecuteTransaction;