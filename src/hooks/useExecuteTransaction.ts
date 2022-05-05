import { useCallback } from 'react'
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3 } from '../contexts/web3Data';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from '../contexts/daoData/index';
import { ProposalData } from "../contexts/daoData/useProposals";
import { ethers } from 'ethers';


const useExecuteTransaction = ({
  proposalData
}: {
  proposalData: ProposalData
}
) => {
  const [{ signerOrProvider }] = useWeb3();
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