import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from './index';
import { ProposalData } from "../daoData/useProposals";
import { ethers } from 'ethers';


const useQueueTransaction = ({
  proposalData
}: {
  proposalData: ProposalData
}
) => {
  const { signerOrProvider } = useWeb3();
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
      contractFn: () => governor.queue(proposalData.targets, [], proposalData.calldatas, ethers.utils.id(proposalData.description)),
      pendingMessage: "Queueing Transaction",
      failedMessage: "Queueing Failed",
      successMessage: "Queueing Completed",
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [contractCallQueueTransaction, daoData, proposalData, signerOrProvider])
  return queueTransaction;
}

export default useQueueTransaction;