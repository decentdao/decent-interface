import { useCallback } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useGovenorModule } from '../providers/govenor/hooks/useGovenorModule';

const useDelegateVote = ({
  delegatee,
  successCallback,
}: {
  delegatee: string | undefined;
  successCallback: () => void;
}) => {
  const {
    votingToken: { votingTokenContract },
  } = useGovenorModule();
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
