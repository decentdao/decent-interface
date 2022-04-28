import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from './index';
import { ProposalData } from "../daoData/useProposals";
import { ethers } from 'ethers';


const useQueueTransaction = ({
  proposalData,
  setPending,
}: {
  proposalData: ProposalData,
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const { signerOrProvider } = useWeb3();
  const [daoData,] = useDAOData();

  const [contractCallQueueTransaction, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let queueTransaction = useCallback(() => {
    if (
      !signerOrProvider ||
      !proposalData ||
      !setPending ||
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
  }, [contractCallQueueTransaction, daoData, proposalData, setPending, signerOrProvider])
  return queueTransaction;
}

export default useQueueTransaction;