import { useCallback } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useDAOData } from '../contexts/daoData/index';

const useDelegateVote = ({
  delegatee,
  successCallback,
}: {
  delegatee: string | undefined;
  successCallback: () => void;
}) => {
  const [
    {
      modules: {
        governor: {
          votingToken: { votingTokenContract },
        },
      },
    },
  ] = useDAOData();
  const [contractCallDelegateVote, contractCallPending] = useTransaction();

  let delegateVote = useCallback(() => {
    if (votingTokenContract === undefined || delegatee === undefined) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => votingTokenContract.delegate(delegatee),
      pendingMessage: 'Delegating Vote',
      failedMessage: 'Vote Delegation Failed',
      successMessage: 'Vote Delegated',
      successCallback: () => successCallback(),
    });
  }, [contractCallDelegateVote, votingTokenContract, delegatee, successCallback]);

  return [delegateVote, contractCallPending] as const;
};

export default useDelegateVote;
