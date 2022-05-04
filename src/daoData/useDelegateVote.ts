import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { useDAOData } from './index';

const useDelegateVote = ({
  delegatee,
  setPending,
}: {
  delegatee: string | undefined,
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const [{ signerOrProvider }] = useWeb3();
  const [ daoData, ] = useDAOData();
  const [contractCallDelegateVote, contractCallPending] = useTransaction();
  const token = daoData.tokenContract;

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let delegateVote = useCallback(() => {
    if (
      signerOrProvider === undefined ||
      setPending === undefined ||
      token === undefined ||
      delegatee === undefined
    ) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => token.delegate(delegatee),
      pendingMessage: "Delegating Vote",
      failedMessage: "Vote Delegation Failed",
      successMessage: "Vote Delegated",
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [contractCallDelegateVote, token, setPending, signerOrProvider, delegatee])
  return delegateVote;
}

export default useDelegateVote;