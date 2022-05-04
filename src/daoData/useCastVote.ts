import { useCallback } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { BigNumber } from 'ethers';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from './index';

const useCastVote = ({
  proposalId,
  vote,
}: {
  proposalId: BigNumber | undefined,
  vote: number | undefined,
}
) => {
  const [{ signerOrProvider }] = useWeb3();
  const [ daoData, ] = useDAOData();

  const [contractCallCastVote] = useTransaction();

  let castVote = useCallback(() => {
    if (
      signerOrProvider === undefined ||
      daoData.moduleAddresses === undefined ||
      proposalId === undefined ||
      vote === undefined 
    ) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(daoData.moduleAddresses[1], signerOrProvider);

    contractCallCastVote({
      contractFn: () => governor.castVote(proposalId, vote),
      pendingMessage: "Casting Vote",
      failedMessage: "Vote Cast Failed",
      successMessage: "Vote Casted",
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [contractCallCastVote, daoData.moduleAddresses, proposalId, signerOrProvider, vote])
  return castVote;
}

export default useCastVote;