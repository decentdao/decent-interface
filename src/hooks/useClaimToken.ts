import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useDAOData } from '../contexts/daoData/index';

const useClaimToken = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signerOrProvider, account },
  } = useWeb3Provider();
  const [
    {
      modules: {
        claim: { claimModuleContract },
      },
    },
  ] = useDAOData();

  const [contractCallClaimToken, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const claimToken = useCallback(() => {
    if (!signerOrProvider || !account || claimModuleContract === undefined) {
      return;
    }

    contractCallClaimToken({
      contractFn: () => claimModuleContract.claimSnap(account),
      pendingMessage: 'Claiming Token',
      failedMessage: 'Claim Tokens Failed',
      successMessage: 'Tokens Claimed',
    });
  }, [contractCallClaimToken, claimModuleContract, signerOrProvider, account]);
  return claimToken;
};

export default useClaimToken;
