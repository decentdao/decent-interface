import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useDAOData } from './index';

const useDelegateVote = ({
  delegatee,
  setPending,
  successCallback,
}: {
  delegatee: string | undefined,
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  successCallback: () => void,
}) => {
  const [{ tokenContract }] = useDAOData();
  const [contractCallDelegateVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let delegateVote = useCallback(() => {
    if (tokenContract === undefined || delegatee === undefined) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => tokenContract.delegate(delegatee),
      pendingMessage: "Delegating Vote",
      failedMessage: "Vote Delegation Failed",
      successMessage: "Vote Delegated",
      successCallback: () => successCallback(),
    });
  }, [contractCallDelegateVote, tokenContract, delegatee, successCallback]);

  return delegateVote;
}

export default useDelegateVote;