import { useCallback } from 'react'
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3 } from '../contexts/web3Data';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from '../contexts/daoData/index';
import { ProposalData } from "../contexts/daoData/useProposals";
import { ethers } from 'ethers';


const useQueueTransaction = ({
  proposalData
}: {
  proposalData: ProposalData
}
) => {
  const [{ signerOrProvider }] = useWeb3();
  const [daoData,] = useDAOData();

  const [contractCallQueueTransaction] = useTransaction();

  let queueTransaction = useCallback(() => {
    if (
      !signerOrProvider ||
      !proposalData ||
      !daoData ||
      !daoData.moduleAddresses
    ) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(daoData.moduleAddresses[1], signerOrProvider);
    contractCallQueueTransaction({
      contractFn: () => governor.queue(proposalData.targets, [0], proposalData.calldatas, ethers.utils.id(proposalData.description)),
      pendingMessage: "Queuing Transaction...",
      failedMessage: "Queuing Failed",
      successMessage: "Queuing Completed",
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [contractCallQueueTransaction, daoData, proposalData, signerOrProvider])
  return queueTransaction;
}

export default useQueueTransaction;