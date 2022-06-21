import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
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
    state: { signerOrProvider },
  } = useWeb3Provider();
  const [
    {
      modules: {
        governor: { governorModuleContract },
      },
    },
  ] = useDAOData();

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const castVote = useCallback(() => {
    if (
      !signerOrProvider ||
      governorModuleContract === undefined ||
      proposalId === undefined ||
      vote === undefined
    ) {
      return;
    }

    contractCallCastVote({
      contractFn: () => governorModuleContract.castVote(proposalId, vote),
      pendingMessage: 'Casting Vote',
      failedMessage: 'Vote Cast Failed',
      successMessage: 'Vote Casted',
    });
  }, [contractCallCastVote, governorModuleContract, proposalId, signerOrProvider, vote]);
  return castVote;
};

export default useCastVote;
