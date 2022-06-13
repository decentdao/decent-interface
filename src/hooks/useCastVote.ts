import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
import { GovernorModule, GovernorModule__factory } from '../assets/typechain-types/module-governor';
import { useDAOData } from '../contexts/daoData/index';

const useCastVote = ({
  proposalId,
  vote,
  setPending,
}: {
  proposalId: BigNumber | undefined;
  vote: number | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signer },
  } = useWeb3Provider();
  const [daoData] = useDAOData();

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let castVote = useCallback(() => {
    if (
      !signer ||
      daoData.moduleAddresses === undefined ||
      proposalId === undefined ||
      vote === undefined
    ) {
      return;
    }

    // @todo we could probably just pull contract from state here.
    const governor: GovernorModule = GovernorModule__factory.connect(
      daoData.moduleAddresses[1],
      signer
    );

    contractCallCastVote({
      contractFn: () => governor.castVote(proposalId, vote),
      pendingMessage: 'Casting Vote',
      failedMessage: 'Vote Cast Failed',
      successMessage: 'Vote Casted',
    });
  }, [contractCallCastVote, daoData.moduleAddresses, proposalId, signer, vote]);
  return castVote;
};

export default useCastVote;
